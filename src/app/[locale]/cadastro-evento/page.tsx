import { Metadata } from 'next';
import EventRegistrationForm from './EventRegistrationForm';

export const metadata: Metadata = {
    title: 'Divulgar Evento — NipponLife',
    description: 'Publique seu evento e alcance a comunidade brasileira no Japão.',
};

export default function CadastroEventoPage() {
    return <EventRegistrationForm />;
}
