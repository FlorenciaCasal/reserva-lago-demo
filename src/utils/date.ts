
export default function hasMin48Hours(dateISO: string) {
    // Fecha de la visita a las 09:30
    const visitDate = new Date(`${dateISO}T09:30:00`);

    const now = new Date();

    const diffMs = visitDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    // return diffHours >= 24;
    return diffHours >= 48;
}
