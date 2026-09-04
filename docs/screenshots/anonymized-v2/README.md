# Imagens anonimizadas de apresentação

Seis cópias editadas com a ferramenta integrada de geração/edição de imagens. Os dados de empresas, vagas, perfil, contactos, datas, métricas e guiões foram substituídos por exemplos fictícios. A edição por IA pode introduzir pequenas diferenças visuais; estas versões são ilustrações da interface, não capturas intactas nem prova de dados reais.

Os originais não foram alterados nem copiados para esta pasta. Estas seis versões integram a galeria do README principal, com indicação explícita da edição e dos dados fictícios.

## Dashboard — claro, EN

![Dashboard com dados ilustrativos](dashboard-light-en.png)

## Candidaturas — claro, EN

![Candidaturas com dados ilustrativos](applications-light-en.png)

## Entrevista — claro, EN

![Entrevista com contactos e preparação fictícios](interview-light-en.png)

## Dashboard — escuro, EN

![Dashboard escuro com dados ilustrativos](dashboard-dark-en.png)

## Entrevista — escuro, PT

![Entrevista escura com dados ilustrativos](interview-dark-pt.png)

## Revisão

### Entrevista no telemóvel — escuro, PT

<img src="interview-mobile-dark-pt.png" alt="Resumo de entrevista no telemóvel com dados ilustrativos" width="320" />

### Verificação das cópias

- Não foram identificados nomes/logótipos reais de empresas ou contactos pessoais nas versões editadas.
- O perfil e a preparação pessoal foram substituídos integralmente por exemplos.
- As métricas dos dashboards são fictícias, não estatísticas do utilizador.
- A galeria inclui cinco imagens de computador e uma de telemóvel.
- Não usar os ficheiros originais com dados pessoais na publicação.

## Instruções usadas na edição

Ferramenta: image_gen integrada (sem CLI).

### interview-mobile-dark-pt-anonymized

```text
Use case: precise-object-edit.
Asset: anonymized mobile screenshot for the Job Application Tracker README.
Input: the single attached screenshot is the EDIT TARGET. It is a narrow 304x691 portrait screenshot of an interview detail page in Portuguese dark mode.
Preserve the original entire framing and narrow mobile aspect ratio, layout, spacing, rounded cards, dark flat colours, font sizes relative to the image, icons, sidebar menu button, PT/EN buttons, theme icon, logout icon, blue edit button, dropdown and all static Portuguese interface text. Do NOT redesign it, add a phone frame, invent sections, expand to desktop, change theme, crop content, or add gradients.
Change only private data, removing it fully, never blur:
- Replace the personal photo avatar at the very top with a neutral grey circle.
- In the subtitle under the page heading replace the complete company/role text with "Empresa de exemplo · Vaga de exemplo".
- In the summary card replace the company logo with a plain neutral grey rounded square, replace the entire company name with "Empresa de exemplo" and linked role with "Vaga de exemplo".
- Replace the date/time with "01/09/2026, 10:00".
- The main heading "Entrevista inicial", status "Concluída", duration "30 minutos", format "Videochamada", static "Abrir ligação", "Preparação", subtitle, "Editar guião", and "Guião pessoal e CV" must remain verbatim.
- Replace the partially visible user-authored body line at the very bottom with "Notas de exemplo".
No original employer name, logo, actual role, personal avatar or date may remain anywhere. Exact Portuguese accents. Pixel-sharp flat screenshot, no new UI features.
```

### dashboard-light-en-anonymized

```text
Use case: precise-object-edit.
Asset: privacy-redacted screenshot for a real application's GitHub README.
Input image: sole edit target, an English LIGHT MODE dashboard screenshot. NOT inspiration for a redesign.
Preserve every original pixel outside the private data areas as closely as possible: exact full screenshot framing and aspect ratio, sidebar, app logo/title, navigation, UI labels, cards, fonts, button shapes, search field, theme and language controls, all table columns and row heights. No cropping, no UI redesign, no invented UI.
Permanently remove private text and logos by overwriting fully, never weak blur. Replace the top right user's avatar with a flat grey circle and the username with "Demo User". In the 5 recent application rows completely replace EVERY original job title and location with "Example role" and "Example location". Replace EVERY company logo with a plain neutral grey rounded square and EVERY company name with "Example company". Replace dates with "01/09/2026". No original company name, logo, location or job title may remain, including partially cut-off bottom rows.
In the eight statistic cards replace actual numeric values and numeric footnotes with plausible explicitly example values: total applications 12 / "12 in the last 30 days"; active applications 8 / "2 at interview stage"; upcoming interviews 2; overdue tasks 0 / "0 due in the next 7 days"; response rate 50% / "6 of 12 sent"; offers received 1; rejections 3; companies 8 / "6 with an application". These are fictional placeholder statistics, not additional features.
Keep all static English interface labels and the existing application status badges unchanged. Tiny unobtrusive note "Illustrative data" in available whitespace below the Dashboard subtitle. Flat pixel-sharp screenshot, not a photo or illustration.
```

### applications-light-en-anonymized

```text
Use case: precise-object-edit. Asset: privacy-anonymized screenshot for the app README. Sole input image is the EDIT TARGET, not a redesign reference. Preserve full frame and aspect ratio, exact interface structure, sidebar, app icon/title, cards, spacing, fonts, button icons, theme and language buttons. Keep all static UI labels and existing status badges. Overwrite sensitive data completely with the specified fictional examples, never weak blur or partial coverage. No original real company logo/name, personal username/avatar, contact details, real role/location/date or personal narrative may remain anywhere, including cut-off bottom rows. Top right replace avatar with neutral grey circle and username with "Demo User". No other decorative additions. Pixel-sharp flat screenshot.
English LIGHT applications list. For ALL visible table rows including partial bottom row, replace role text with "Example role" and subtitle with "Example location"; company logos with neutral grey rounded squares and names with "Example company". Replace dates in table with "01/09/2026". Replace next-task personal text with "Example task" (preserve existing static "No next task" where present). Replace both date filter values and active filter dates with 01/09/2026 and 30/09/2026 respectively. Keep different existing blue/red/amber application status dropdowns and their text unchanged. Small "Illustrative data" note below page subtitle.
```

### interview-light-en-anonymized

```text
Use case: precise-object-edit. Asset: privacy-anonymized screenshot for the app README. Sole input image is the EDIT TARGET, not a redesign reference. Preserve full frame and aspect ratio, exact interface structure, sidebar, app icon/title, cards, spacing, fonts, button icons, theme and language buttons. Keep all static UI labels and existing status badges. Overwrite sensitive data completely with the specified fictional examples, never weak blur or partial coverage. No original real company logo/name, personal username/avatar, contact details, real role/location/date or personal narrative may remain anywhere, including cut-off bottom rows. Top right replace avatar with neutral grey circle and username with "Demo User". No other decorative additions. Pixel-sharp flat screenshot.
English LIGHT interview detail. Replace page title (currently user-authored Portuguese) with "Example interview". Subtitle with "Example company · Example role". In summary card remove logo replacing with plain grey square; name "Example company"; linked job "Example role". Date "1 Sept 2026, 10:00"; duration "30 minutes". People card: replace ENTIRE recruiter name, email, phone INCLUDING the visible prefixes and existing red scribbles with "Example recruiter", "recruiter@example.com", "+000 000 000 000"; remove red markings completely against matching background. Preserve recruiter label/icons and Participants "Not defined".
Preparation card: Preserve static headings "Preparation", description and "Personal and CV talking points", and Edit talking points button. REMOVE ALL original preparation/body text down to bottom edge, including partial sentences. Replace it with just three fictional paragraphs, no original personal details:
"Example preparation notes"
"Briefly introduce your background, relevant skills and interest in the role."
"Prepare one example of teamwork and one example of solving a technical problem."
Leave remaining space clean matching white card. Do not add features or new cards. Add small "Illustrative data" note below page subtitle.
```

### dashboard-dark-en-anonymized

```text
Use case: precise-object-edit. Asset: privacy-anonymized screenshot for the app README. Sole input image is the EDIT TARGET, not a redesign reference. Preserve full frame and aspect ratio, exact interface structure, sidebar, app icon/title, cards, spacing, fonts, button icons, theme and language buttons. Keep all static UI labels and existing status badges. Overwrite sensitive data completely with the specified fictional examples, never weak blur or partial coverage. No original real company logo/name, personal username/avatar, contact details, real role/location/date or personal narrative may remain anywhere, including cut-off bottom rows. Top right replace avatar with neutral grey circle and username with "Demo User". No other decorative additions. Pixel-sharp flat screenshot.
English DARK dashboard screenshot. In ALL 5 recent application rows replace original role with "Example role", location with "Example location", company name with "Example company", logo with neutral grey square and date with "01/09/2026". Keep status badges/static labels unchanged.
Replace statistic values/footnotes with fictional examples: total applications 12 / "12 in the last 30 days"; active applications 8 / "2 at interview stage"; upcoming interviews 2; overdue tasks 0 / "0 due in the next 7 days"; response rate 50% / "6 of 12 sent"; offers received 1; rejections 3; companies 8 / "6 with an application". Keep original DARK colours exactly. Small "Illustrative data" note below Dashboard subtitle.
```

### interview-dark-pt-anonymized

```text
Use case: precise-object-edit. Asset: privacy-anonymized screenshot for the app README. Sole input image is the EDIT TARGET, not a redesign reference. Preserve full frame and aspect ratio, exact interface structure, sidebar, app icon/title, cards, spacing, fonts, button icons, theme and language buttons. Keep all static UI labels and existing status badges. Overwrite sensitive data completely with the specified fictional examples, never weak blur or partial coverage. No original real company logo/name, personal username/avatar, contact details, real role/location/date or personal narrative may remain anywhere, including cut-off bottom rows. Top right replace avatar with neutral grey circle and username with "Demo User". No other decorative additions. Pixel-sharp flat screenshot.
Portuguese DARK interview detail. Top right generic username "Utilizador Demo" (instead of Demo User). Page title "Entrevista de exemplo". Subtitle "Empresa de exemplo · Vaga de exemplo". Summary card logo plain grey square, name "Empresa de exemplo", linked role "Vaga de exemplo". Date "01/09/2026, 10:00". Preserve existing duration and video format. Replace participant person name COMPLETELY with "Participante de exemplo". Recruiter "Por definir" can remain. "Abrir ligação" static text can remain; no visible actual URL.
Preparation card: Keep "Preparação", its subtitle, "Guião pessoal e CV", and "Editar guião" button. Remove ALL original body text to bottom edge, including personal education, internship employer, work details and partially clipped lines. Replace with only three fictional paragraphs:
"Notas de preparação de exemplo"
"Apresentar brevemente o percurso, as competências e o interesse na vaga."
"Preparar um exemplo de trabalho em equipa e outro de resolução de um problema técnico."
Leave remaining card space clean in original dark background. Small note "Dados ilustrativos" below page subtitle. No new cards or features.
```
