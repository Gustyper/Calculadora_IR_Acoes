export function calcularVencimentoDARF(mesReferencia: string): string {
  // mesReferencia vem como "2025-10"
  const [year, month] = mesReferencia.split('-').map(Number);
  
  // Criamos uma data para o mês seguinte (month é 0-indexed no JS, então month + 1 já é o próximo)
  // O dia 0 do mês subsequente ao próximo é o último dia do mês seguinte.
  const ultimoDiaMesSeguinte = new Date(year, month + 1, 0);
  
  // Ajuste para dia útil (Sábado -> Sexta, Domingo -> Sexta)
  let dia = ultimoDiaMesSeguinte.getDay();
  if (dia === 6) { // Sábado
    ultimoDiaMesSeguinte.setDate(ultimoDiaMesSeguinte.getDate() - 1);
  } else if (dia === 0) { // Domingo
    ultimoDiaMesSeguinte.setDate(ultimoDiaMesSeguinte.getDate() - 2);
  }

  return ultimoDiaMesSeguinte.toLocaleDateString('pt-BR');
}