WEB PUSH - optionele tweede notificatielaag

Athenaeum V1 gebruikt Telegram als de betrouwbare gratis externe reminderlaag. Echte browser-push terwijl de app volledig gesloten is vereist een server-side Push-service met VAPID-sleutels en subscriptions.

De architectuur is voorzien, maar niet standaard geactiveerd omdat dit extra sleutelbeheer toevoegt. Telegram + lokale PWA-notificaties na openen blijven volledig bruikbaar zonder deze stap.

Een toekomstige Athenaeum-update kan dezelfde Supabase Edge Function-infrastructuur gebruiken voor Web Push. Bewaar VAPID private keys altijd server-side, nooit in GitHub JavaScript.
