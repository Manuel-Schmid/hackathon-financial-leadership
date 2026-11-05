import { PageTitle } from '@/components/ui/atoms';

export function Imprint() {
  return (
    <main className="mx-auto w-full max-w-[760px] space-y-4 p-4 lg:p-7">
      <PageTitle title="Impressum" />
      <section className="card space-y-3 p-5 leading-relaxed">
        <p>Studierendenprojekt im Rahmen des Hackathons Finanzielle Führung, Universität St. Gallen (HSG), HS26.</p>
        <p>
          <b>Keine Anlageberatung.</b> KUBUS dient der Ausbildung und zeigt vereinfachte Scores. Die Daten stammen von Yahoo Finance,
          sind ungeprüft und können lückenhaft sein.
        </p>
      </section>
    </main>
  );
}
