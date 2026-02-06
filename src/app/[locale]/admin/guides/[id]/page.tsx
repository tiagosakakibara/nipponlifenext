"use strict";

export default function GuideEditPage({ params }: { params: { id: string } }) {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Editar Guia (ID: {params.id})</h1>
            <p>A página de edição ainda está sendo implementada.</p>
        </div>
    );
}
