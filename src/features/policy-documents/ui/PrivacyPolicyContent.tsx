import {
  privacyPolicyDocument,
  type PrivacyPolicySection,
  type PrivacyPolicyTable,
} from '../model/privacyPolicy'

type PolicyDataTableProps = {
  columnWidths?: readonly (number | undefined)[]
  table: PrivacyPolicyTable
}

function PolicyDataTable({ columnWidths, table }: PolicyDataTableProps) {
  return (
    <div className="w-full overflow-hidden rounded-m border-stroke-md border-line-default">
      <table className="w-full table-fixed border-collapse typo-caption">
        <colgroup>
          {table.columns.map((column, index) => (
            <col key={column} style={{ width: columnWidths?.[index] }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {table.columns.map((column) => (
              <th
                className="h-[32px] border border-surface-default bg-primary-300 p-[10px] font-medium text-brand-primary"
                key={column}
                scope="col"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.join('-')}>
              {row.map((cell) => (
                <td
                  className="border border-line-default bg-surface-default p-[10px] text-center text-fg-secondary"
                  key={cell}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PrivacySection({ description, items, title }: PrivacyPolicySection) {
  return (
    <section className="shrink-0 typo-body-01">
      <h2 className="m-0 font-medium text-fg-primary">{title}</h2>
      {description ? <p className="m-0 text-fg-secondary">{description}</p> : null}
      {items ? (
        <ol className="m-0 list-decimal pl-m text-fg-secondary">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      ) : null}
    </section>
  )
}

export function PrivacyPolicyContent() {
  const document = privacyPolicyDocument

  return (
    <article
      aria-labelledby="privacy-policy-title"
      className="flex min-h-0 flex-1 flex-col gap-m overflow-y-auto px-s pb-xl"
      role="tabpanel"
    >
      <div className="shrink-0 typo-body-02 text-fg-secondary">
        <p className="m-0" id="privacy-policy-title">
          {document.name}
        </p>
        <p className="m-0">시행일자: {document.effectiveDate}</p>
      </div>

      <div className="shrink-0 typo-body-01">
        <p className="m-0 text-fg-primary">{document.introduction[0]}</p>
        <p className="m-0 text-fg-secondary">{document.introduction[1]}</p>
      </div>

      <section className="flex shrink-0 flex-col gap-s">
        <h2 className="m-0 typo-body-01 font-medium text-fg-primary">
          {document.collection.title}
        </h2>
        <PolicyDataTable columnWidths={[180, undefined, 65]} table={document.collection.table} />
        <p className="m-0 typo-body-02 text-fg-secondary">{document.collection.note}</p>
      </section>

      {document.sections.map((section) => (
        <PrivacySection key={section.title} {...section} />
      ))}

    </article>
  )
}
