# Supabase Email Templates

Customised HTML templates for the transactional e-mails sent by Supabase
Auth on behalf of PIB Vila Canaan. The templates carry the church's
visual identity so recipients no longer see the generic Supabase
branding when they open the e-mail.

## Why these files live here

The templates are pasted into the Supabase dashboard
(**Authentication → Email Templates**), not loaded from this repo at
runtime. Keeping the source of truth in git means:

- Anyone can review and propose changes via a normal PR
- If the templates are accidentally deleted or overwritten on Supabase,
  there is a versioned copy to restore from
- The Portuguese copy stays consistent with the rest of the public site

## Files

| File                  | Maps to Supabase template | When the user receives it                      |
| --------------------- | ------------------------- | ---------------------------------------------- |
| `confirm-signup.html` | **Confirm signup**        | After signing up at `/cadastro`                |
| `reset-password.html` | **Reset Password**        | After requesting a reset at `/esqueci-senha`   |
| `change-email.html`   | **Change Email Address**  | After requesting an e-mail change in `/perfil` |

The **Magic Link** and **Invite User** templates are intentionally left
untouched — the project does not use either flow.

## Variables

Supabase makes the following placeholders available inside the
templates. Do not rename them.

| Placeholder              | Resolves to                                           |
| ------------------------ | ----------------------------------------------------- |
| `{{ .ConfirmationURL }}` | Single-use link for the action (confirm, reset, etc.) |
| `{{ .Token }}`           | Raw token (alternative to the URL)                    |
| `{{ .TokenHash }}`       | Hash of the token                                     |
| `{{ .SiteURL }}`         | Site URL from Auth settings                           |
| `{{ .Email }}`           | The recipient's e-mail                                |

## How to apply a template on Supabase

1. Open the Supabase dashboard for the **production** project
2. **Authentication → Email Templates**
3. Select the template that matches the file (e.g. **Confirm signup**)
4. **Subject heading:** match the file's `<title>` element, in
   Portuguese (e.g. `Confirme seu cadastro — PIB Vila Canaan`)
5. **Message body:** open the corresponding `.html` file from this
   folder, copy its full contents, and paste into the editor
6. Click **Save**
7. Repeat for each template

> 💡 Use the **Send test email** button on Supabase to confirm the
> render before going live. The visual differs slightly between
> webmail clients — Gmail and Outlook are the priority targets.

## Known limitations

- The **From address** is `noreply@mail.supabase.io` and cannot be
  changed without configuring Custom SMTP. Custom SMTP through a real
  domain (e.g. Resend) requires DNS verification, which depends on the
  church owning a domain. Until then, the visual identity is delivered
  by the body of the e-mail, not by the sender field.
- Supabase's free tier rate-limits outbound auth e-mails (around 4 per
  hour to the same address). If you re-test signup repeatedly, expect
  occasional delays.

## Editing the templates

When updating a template:

1. Edit the `.html` file here in a feature branch
2. Open a PR for review
3. Once merged, manually paste the new version into the matching
   Supabase template on **production** (and `dev` if applicable) — the
   site does not pick it up automatically
