import { Button } from '../../../shared/ui'

import uploadCompleteIcon from '../assets/upload-complete.svg'
import uploadDeleteIcon from '../assets/upload-delete.svg'
import uploadLoadingIcon from '../assets/upload-loading.svg'

export type ProjectMaterialListItemModel = {
  id: string
  name: string
  status: 'uploading' | 'complete'
}

type ProjectMaterialListProps = {
  items: ProjectMaterialListItemModel[]
  onRemove: (id: string) => void
}

export function ProjectMaterialList({ items, onRemove }: ProjectMaterialListProps) {
  return (
    <ul className="m-0 flex list-none flex-col p-0">
      {items.map((item) => (
        <li
          className="flex h-[32px] items-start gap-xs border-b border-line-default last:border-b-0"
          key={item.id}
        >
          <span
            aria-label={item.status === 'uploading' ? '업로드 중' : '업로드 완료'}
            className="flex size-[24px] shrink-0 items-center justify-center"
            role="img"
          >
            <img
              alt=""
              aria-hidden="true"
              className={
                item.status === 'uploading'
                  ? 'size-[24px] animate-spin motion-reduce:animate-none'
                  : 'h-[11px] w-[15px]'
              }
              height={item.status === 'uploading' ? 24 : 11}
              src={item.status === 'uploading' ? uploadLoadingIcon : uploadCompleteIcon}
              width={item.status === 'uploading' ? 24 : 15}
            />
          </span>
          <span className="min-w-0 flex-1 truncate typo-body-02 text-fg-primary">{item.name}</span>
          <Button
            aria-label={`${item.name} 삭제`}
            className="size-[32px] px-0"
            onClick={() => onRemove(item.id)}
            size="small"
            variant="basic"
          >
            <span className="flex size-[24px] items-center justify-center">
              <img
                alt=""
                aria-hidden="true"
                className="h-[16px] w-[11px]"
                height="16"
                src={uploadDeleteIcon}
                width="11"
              />
            </span>
          </Button>
        </li>
      ))}
    </ul>
  )
}
