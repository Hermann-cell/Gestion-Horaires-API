export function activationEmailTemplate(
  name: string,
  activationLink: string
) {
  return `
  <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:40px;">
    <div style="max-width:600px;margin:auto;background:white;border-radius:8px;padding:30px">

      <h2 style="color:#2c3e50">Bienvenue sur Gestion Horaire</h2>

      <p>Bonjour <strong>${name}</strong>,</p>

      <p>
        Votre compte a été créé avec succès.  
        Pour activer votre compte et définir votre mot de passe personnel,
        veuillez cliquer sur le bouton ci-dessous.
      </p>

      <div style="text-align:center;margin:30px 0">
        <a href="${activationLink}"
           style="
             background:#2563eb;
             color:white;
             padding:14px 24px;
             text-decoration:none;
             border-radius:6px;
             font-weight:bold;
           ">
           Activer mon compte
        </a>
      </div>

      <p>
        Ce lien est valide pendant <strong>24 heures</strong>.
      </p>

      <p>
        Si vous n’êtes pas à l’origine de cette demande,
        vous pouvez ignorer cet email.
      </p>

      <hr style="margin:30px 0"/>

      <p style="font-size:12px;color:#6b7280">
        © ${new Date().getFullYear()} Gestion Horaires.
        Tous droits réservés.
      </p>

    </div>
  </div>
  `;
}