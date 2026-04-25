import { ReactNode } from "react"
import styles from './button.module.css'

type Props = {
    children: ReactNode;
    onClick: () => void;
    isClicked?: boolean;
 }

export default function Button({ onClick, children, isClicked }: Props) {
  return (
    <button type="button" disabled={isClicked} onClick={onClick} className={[styles.button, styles.padding].join(" ")}>{children}</button>
  )
}