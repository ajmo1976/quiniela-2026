const { ALL_MATCHES } = require('./src/app/matches/matchesData.ts');

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

const GROUP_DATA = {
  A: [
    { name: "México", flag: "🇲🇽", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Sudáfrica", flag: "🇿🇦", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Rep. de Corea", flag: "🇰🇷", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Chequia", flag: "🇨🇿", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  ],
  B: [
    { name: "Canadá", flag: "🇨🇦", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Suiza", flag: "🇨🇭", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Bosnia y Herz.", flag: "🇧🇦", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Catar", flag: "🇶🇦", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  ],
  C: [
    { name: "Brasil", flag: "🇧🇷", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Marruecos", flag: "🇲🇦", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Haití", flag: "🇭🇹", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Escocia", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  ],
  D: [
    { name: "EE. UU.", flag: "🇺🇸", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Australia", flag: "🇦🇺", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Paraguay", flag: "🇵🇾", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Turquía", flag: "🇹🇷", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  ],
  E: [
    { name: "Alemania", flag: "🇩🇪", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Ecuador", flag: "🇪🇨", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Costa de Marfil", flag: "🇨🇮", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Curazao", flag: "🇨🇼", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  ],
  F: [
    { name: "Países Bajos", flag: "🇳🇱", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Japón", flag: "🇯🇵", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Suecia", flag: "🇸🇪", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Túnez", flag: "🇹🇳", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  ],
  G: [
    { name: "Bélgica", flag: "🇧🇪", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Egipto", flag: "🇪🇬", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Irán", flag: "🇮🇷", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Nva. Zelanda", flag: "🇳🇿", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  ],
  H: [
    { name: "España", flag: "🇪🇸", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Uruguay", flag: "🇺🇾", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Arabia Saudí", flag: "🇸🇦", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "I. Cabo Verde", flag: "🇨🇻", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  ],
  I: [
    { name: "Francia", flag: "🇫🇷", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Senegal", flag: "🇸🇳", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Irak", flag: "🇮🇶", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Noruega", flag: "🇳🇴", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  ],
  J: [
    { name: "Argentina", flag: "🇦🇷", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Austria", flag: "🇦🇹", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Argelia", flag: "🇩🇿", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Jordania", flag: "🇯🇴", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  ],
  K: [
    { name: "Portugal", flag: "🇵🇹", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Colombia", flag: "🇨🇴", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "RD Congo", flag: "🇨🇩", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Uzbekistán", flag: "🇺🇿", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  ],
  L: [
    { name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Croacia", flag: "🇭🇷", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Ghana", flag: "🇬🇭", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Panamá", flag: "🇵🇦", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  ],
};

ALL_MATCHES.forEach(match => {
  const group = match.group;
  const groupTeams = GROUP_DATA[group];
  if (!groupTeams) {
    console.log(`Group not found for match ${match.id}: ${group}`);
    return;
  }
  const homeFound = groupTeams.find(t => t.name === match.homeTeam.name);
  const awayFound = groupTeams.find(t => t.name === match.awayTeam.name);
  if (!homeFound) {
    console.log(`Home team mismatch: "${match.homeTeam.name}" in match ${match.id} (Group ${group})`);
  }
  if (!awayFound) {
    console.log(`Away team mismatch: "${match.awayTeam.name}" in match ${match.id} (Group ${group})`);
  }
});
