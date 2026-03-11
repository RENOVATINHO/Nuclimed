export default function PlanoMevPage({ params }: { params: { id: string } }) {
  return <h1 className="text-2xl font-bold">Plano MEV {params.id}</h1>;
}
