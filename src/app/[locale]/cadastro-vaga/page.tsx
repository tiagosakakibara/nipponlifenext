import { Metadata } from 'next';
import JobRegistrationForm from './JobRegistrationForm';

export const metadata: Metadata = {
    title: 'Publicar Vaga de Emprego — NipponLife',
    description: 'Publique sua vaga de emprego no NipponLife e alcance a comunidade brasileira no Japão.',
};

export default function CadastroVagaPage() {
    return <JobRegistrationForm />;
}
