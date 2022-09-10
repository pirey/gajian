import { NextPage } from "next"

const Checklist: NextPage = () => {
  return (
    <div className="p-8">
      <h2 className="text-2xl pb-4 font-extrabold uppercase">Future Plans</h2>
      <ul className="list-disc">
        <li>
          <del>calculate countdown</del>
        </li>
        <li>
          <del>show different messages</del>
        </li>
        <li>
          <del>let users specify payday</del>
        </li>
        <li>let users specify holiday</li>
        <li>fetch holiday data from somewhere</li>
      </ul>
    </div>
  )
}
export default Checklist
