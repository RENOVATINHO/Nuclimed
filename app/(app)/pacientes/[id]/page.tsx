export default function PacientePage({ params }: { params: { id: string } }) {
  return <h1 className="text-2xl font-bold">Paciente {params.id}</h1>;
}
