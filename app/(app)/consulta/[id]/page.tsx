export default function ConsultaPage({ params }: { params: { id: string } }) {
  return <h1 className="text-2xl font-bold">Consulta {params.id}</h1>;
}
