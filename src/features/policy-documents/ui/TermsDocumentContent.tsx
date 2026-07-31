import { termsDocument } from '../model/termsOfService'

type TermsDocumentContentProps = {
  id: string
  labelledBy: string
}

export function TermsDocumentContent({ id, labelledBy }: TermsDocumentContentProps) {
  return (
    <article
      aria-labelledby={labelledBy}
      className="flex min-h-0 flex-1 flex-col gap-m overflow-y-auto px-s pb-xl"
      id={id}
      role="tabpanel"
    >
      <div className="shrink-0 typo-body-02 text-fg-secondary">
        <p className="m-0">{termsDocument.name}</p>
        <p className="m-0">시행일자: {termsDocument.effectiveDate}</p>
      </div>

      {termsDocument.sections.map((section) => (
        <section className="shrink-0 typo-body-01" key={section.title}>
          <h2 className="m-0 font-medium text-fg-primary">{section.title}</h2>
          {section.description ? (
            <p className="m-0 text-fg-secondary">{section.description}</p>
          ) : null}
          {section.items ? (
            <ol className="m-0 list-decimal pl-m text-fg-secondary">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          ) : null}
          {section.note ? <p className="m-0 text-fg-secondary">{section.note}</p> : null}
        </section>
      ))}
    </article>
  )
}
