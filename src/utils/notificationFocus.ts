const KEY = 'dormsync_notification_focus';

export type NotificationFocusPayload = { onModel: string; relatedId: string };

export function stashNotificationFocus(payload: NotificationFocusPayload): void {
    try {
        sessionStorage.setItem(KEY, JSON.stringify(payload));
    } catch {
        /* ignore quota / private mode */
    }
}

export function takeNotificationFocus(): NotificationFocusPayload | null {
    try {
        const raw = sessionStorage.getItem(KEY);
        if (!raw) return null;
        sessionStorage.removeItem(KEY);
        const parsed = JSON.parse(raw) as NotificationFocusPayload;
        if (parsed?.onModel && parsed?.relatedId) return parsed;
        return null;
    } catch {
        return null;
    }
}
