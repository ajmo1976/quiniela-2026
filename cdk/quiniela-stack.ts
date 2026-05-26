import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

/**
 * CDK Stack para la Quiniela 2026
 *
 * Provisiona:
 * - VPC con subnets públicas/privadas
 * - Aurora Serverless v2 (PostgreSQL 15)
 * - Secret en Secrets Manager con las credenciales de la BD
 *
 * Uso:
 *   npx cdk deploy --app "npx ts-node cdk/quiniela-stack.ts"
 *
 * Antes de ejecutar, instalar dependencias:
 *   npm install -D aws-cdk-lib constructs
 */
export class QuinielaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ─── VPC ────────────────────────────────────────────────
    const vpc = new ec2.Vpc(this, 'QuinielaVpc', {
      maxAzs: 2,
      natGateways: 0, // usar Aurora Serverless con acceso público para ahorrar costos en dev
    });

    // ─── Credenciales de la base de datos ─────────────────────
    const dbCredentials = new secretsmanager.Secret(this, 'QuinielaDbSecret', {
      secretName: 'quiniela-2026/db-credentials',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'quiniela_admin' }),
        generateStringKey: 'password',
        excludePunctuation: true,
        passwordLength: 24,
      },
    });

    // ─── Security Group ─────────────────────────────────────
    const dbSg = new ec2.SecurityGroup(this, 'QuinielaDbSg', {
      vpc,
      description: 'Security group for Quiniela 2026 Aurora cluster',
      allowAllOutbound: true,
    });
    dbSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(5432), 'Allow PostgreSQL from anywhere (dev only)');

    // ─── Aurora Serverless v2 (PostgreSQL) ──────────────────
    const cluster = new rds.DatabaseCluster(this, 'QuinielaAurora', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_15_8,
      }),
      credentials: rds.Credentials.fromSecret(dbCredentials),
      defaultDatabaseName: 'quiniela2026',
      serverlessV2MinCapacity: 0.5,
      serverlessV2MaxCapacity: 2,
      writer: rds.ClusterInstance.serverlessV2('writer', {
        publiclyAccessible: true, // enable for dev – disable in prod
      }),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      securityGroups: [dbSg],
      removalPolicy: cdk.RemovalPolicy.DESTROY, // dev only
    });

    // ─── Outputs ────────────────────────────────────────────
    new cdk.CfnOutput(this, 'ClusterEndpoint', {
      value: cluster.clusterEndpoint.hostname,
      description: 'Aurora cluster endpoint',
    });

    new cdk.CfnOutput(this, 'SecretArn', {
      value: dbCredentials.secretArn,
      description: 'ARN of the DB credentials secret',
    });

    new cdk.CfnOutput(this, 'DatabaseUrl', {
      value: `postgresql://quiniela_admin:<PASSWORD>@${cluster.clusterEndpoint.hostname}:5432/quiniela2026?sslmode=require`,
      description: 'DATABASE_URL template – replace <PASSWORD> with the secret value',
    });
  }
}

// ─── App Entry Point ────────────────────────────────────────
const app = new cdk.App();
new QuinielaStack(app, 'QuinielaStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
});
app.synth();
