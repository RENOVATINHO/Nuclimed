export default function AvaliacaoMevPage({
  params,
}: {
  params: { pacienteId: string };
}) {
  return (
    <h1 className="text-2xl font-bold">Avaliação MEV - Paciente {params.pacienteId}</h1>
  );
}
