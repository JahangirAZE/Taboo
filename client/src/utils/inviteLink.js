// Builds a shareable URL that pre-fills the "Join a room" form with a code,
// so anyone who opens it can hop straight into the room.
export function getInviteLink(code) {
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    url.searchParams.set("room", code);
    return url.toString();
}

// Copies the invite link to the clipboard. Falls back to a hidden textarea
// for browsers/contexts where navigator.clipboard isn't available (e.g. non-HTTPS).
export async function copyInviteLink(code) {
    const link = getInviteLink(code);

    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(link);
            return true;
        } catch {
            // fall through to fallback below
        }
    }

    try {
        const textarea = document.createElement("textarea");
        textarea.value = link;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(textarea);
        return ok;
    } catch {
        return false;
    }
}