import { PageTitle } from '@/components/ui/atoms';

export function About() {
  return (
    <main className="mx-auto w-full max-w-[760px] space-y-4 p-4 lg:p-7">
      <PageTitle title="Über uns" sub="Hackathon Finanzielle Führung, HSG, HS26" />
      <section className="card space-y-2 p-5 leading-relaxed">
        <h2 className="font-title text-[17px] font-semibold">Was ist KUBUS?</h2>
        <p>
          20 Kennzahlen pro Firma sind zu viel für einen Blick. KUBUS zeigt jedes Unternehmen deshalb als Punkt in einem Würfel
          mit den drei Zielen des Zieldreiecks: Liquidität, Rentabilität und Sicherheit. Von dort führt der Weg über Filter und
          Watchlists bis zur einzelnen Kennzahl mit Formel und Richtwert.
        </p>
      </section>
      <section className="card space-y-2 p-5 leading-relaxed">
        <h2 className="font-title text-[17px] font-semibold">Wer steht dahinter?</h2>
        <p>Ein Team aus vier Studierenden der Universität St. Gallen, entstanden in einem 24-Stunden-Hackathon.</p>
      </section>
    </main>
  );
}
