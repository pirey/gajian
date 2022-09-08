import { NextPage } from "next"

const Checklist: NextPage = () => {
  return (
    <ul className="list-disc">
      <li>
        <del>calculate countdown</del>
      </li>
      <li>let users specify payday</li>
      <li>let users specify holiday</li>
      <li>show different messages</li>
    </ul>
  )
}
export default Checklist
