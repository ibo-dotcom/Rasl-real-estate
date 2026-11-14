Edge function `resolve-map` (deployed on the Supabase project, JWT required).
POST {"url": "<Google Maps link>"} → {"lat": .., "lng": ..}. It follows short links (maps.app.goo.gl) only to Google hosts and reads the place from the final URL (!3d..!4d.., ?q=, /place/, /search/, @lat,lng).
