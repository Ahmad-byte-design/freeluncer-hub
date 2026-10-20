import type { KeyboardRef, PropSchema } from '@/registry';

export function PropsTable({ props }: { props: PropSchema[] }) {
  return (
    <div className="wr-table-wrap">
      <table className="wr-table">
        <caption className="wr-visually-hidden">
          Options accepted by createAccordion
        </caption>
        <thead>
          <tr>
            <th scope="col">Prop</th>
            <th scope="col">Type</th>
            <th scope="col">Default</th>
            <th scope="col">What it does</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name}>
              <th scope="row" data-label="Prop">
                <code>{prop.name}</code>
              </th>
              <td data-label="Type">
                <code className="wr-table__type">{prop.type}</code>
              </td>
              <td data-label="Default">
                <code className="wr-table__default">{prop.defaultValue}</code>
              </td>
              <td data-label="What it does">{prop.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function KeyboardTable({ rows }: { rows: KeyboardRef[] }) {
  return (
    <ul className="wr-keys">
      {rows.map((row) => (
        <li className="wr-keys__row" key={row.combo.join('+')}>
          <span className="wr-keys__combo">
            {row.combo.map((key) => (
              <kbd key={key}>{key}</kbd>
            ))}
          </span>
          <span className="wr-keys__does">{row.does}</span>
        </li>
      ))}
    </ul>
  );
}

export function FileList({ files, libPath }: { files: string[]; libPath: string }) {
  return (
    <div className="wr-files">
      <ul>
        {files.map((file) => (
          <li key={file}>
            <code>{file}</code>
          </li>
        ))}
      </ul>
      <p className="wr-files__note">
        Nothing in {libPath} imports React, so a framework is never in the way. The React tab
        in the Code panel is the one call site a React app writes; everything below it is
        these files.
      </p>
    </div>
  );
}