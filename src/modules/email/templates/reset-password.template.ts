export function resetPasswordTemplate(link: string) {
  return `
  <div style="font-family:Arial;padding:40px;background:#f5f7fb">
    <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:8px">

      <h2 style="color:#1f2937">Réinitialisation de votre mot de passe</h2>

      <p>
        Nous avons reçu une demande de réinitialisation de votre mot de passe.
      </p>

      <p>
        Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe.
      </p>

      <div style="text-align:center;margin:30px 0">
        <a href="${link}"
           style="background:#2563eb;color:white;padding:14px 22px;border-radius:6px;text-decoration:none;font-weight:bold">
           Réinitialiser mon mot de passe
        </a>
      </div>

      <p>Ce lien expire dans <strong>1 heure</strong>.</p>

      <p style="font-size:12px;color:#6b7280">
        Si vous n'avez pas demandé cette action, ignorez simplement cet email.
      </p>

    </div>
  </div>
  `;
}