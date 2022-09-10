import type { NextPage } from "next"
import Head from "next/head"
import React from "react"
import dayjs from "dayjs"

enum DAY {
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
  Sunday = 0,
}

const dayStringByIndex = (day: DAY) => {
  const dayMap = {
    [DAY.Monday]: "Senin",
    [DAY.Tuesday]: "Selasa",
    [DAY.Wednesday]: "Rabu",
    [DAY.Thursday]: "Kamis",
    [DAY.Friday]: "Jum'at",
    [DAY.Saturday]: "Sabtu",
    [DAY.Sunday]: "Minggu",
  }
  return dayMap[day]
}

const dayStringByDate = (date: dayjs.Dayjs) => {
  return dayStringByIndex(date.day())
}

const errorString = (message?: string): string =>
  message ? `Error: ${message}` : `Error`

const range = (n: number): number[] => Array.from(Array(n + 1).keys()).slice(1)

const isWeekendDay = (date: dayjs.Dayjs): boolean => {
  const paydayIndex = date.day()
  return [DAY.Saturday, DAY.Sunday].includes(paydayIndex)
}

const calculateWeekendsBetweenDates = (
  dateStart: dayjs.Dayjs,
  dateEnd: dayjs.Dayjs
): number => {
  const diffDay = dateEnd.diff(dateStart, "day")
  const nextDates = range(diffDay).map((numDay) => {
    return dateStart.add(numDay, "day")
  })
  return [dateStart, ...nextDates].filter((nextDate) => isWeekendDay(nextDate))
    .length
}

const calculateDaysBetweenDates = (
  dateStart: dayjs.Dayjs,
  dateEnd: dayjs.Dayjs
): number => {
  return dateEnd.diff(dateStart, "day")
}

const calculateWorkdaysBetweenDates = (
  dateStart: dayjs.Dayjs,
  dateEnd: dayjs.Dayjs
): number => {
  return (
    calculateDaysBetweenDates(dateStart, dateEnd) -
    calculateWeekendsBetweenDates(dateStart, dateEnd)
  )
}

const calculateDaysAhead = (today: dayjs.Dayjs, payday: number): number => {
  const currentMonthPayday = today.date(payday)
  const nextMonthPayday = today.month(today.month() + 1).date(payday)

  switch (true) {
    case today.isSame(currentMonthPayday):
      return 0
    case today.isBefore(currentMonthPayday):
      return calculateDaysBetweenDates(today, currentMonthPayday)
    case today.isAfter(currentMonthPayday):
      return calculateDaysBetweenDates(today, nextMonthPayday)
    default:
      return NaN
  }
}

const calculateWorkdaysAhead = (today: dayjs.Dayjs, payday: number): number => {
  const currentMonthPayday = today.date(payday)
  const nextMonthPayday = today.month(today.month() + 1).date(payday)

  switch (true) {
    case today.isSame(currentMonthPayday):
      return 0
    case today.isBefore(currentMonthPayday):
      return calculateWorkdaysBetweenDates(today, currentMonthPayday)
    case today.isAfter(currentMonthPayday):
      return calculateWorkdaysBetweenDates(today, nextMonthPayday)
    default:
      return NaN
  }
}

const calculateWeekendsAhead = (today: dayjs.Dayjs, payday: number): number => {
  const currentMonthPayday = today.date(payday)
  const nextMonthPayday = today.month(today.month() + 1).date(payday)

  switch (true) {
    case today.isSame(currentMonthPayday):
      return 0
    case today.isBefore(currentMonthPayday):
      return calculateWeekendsBetweenDates(today, currentMonthPayday)
    case today.isAfter(currentMonthPayday):
      return calculateWeekendsBetweenDates(today, nextMonthPayday)
    default:
      return NaN
  }
}

const isPaydayOnThisWeek = (today: dayjs.Dayjs, payday: number): boolean => {
  const todayWeekday = today.day()
  const paydayWeekday = today.date(payday).day()
  return todayWeekday <= paydayWeekday
}

const isPaydayOnNextWeek = (today: dayjs.Dayjs, payday: number): boolean => {
  return !isPaydayOnThisWeek(today, payday)
}

const calculatePreviousWeekdayDate = (date: dayjs.Dayjs): dayjs.Dayjs => {
  switch (true) {
    case date.day() === DAY.Saturday:
      return date.subtract(1, "day")
    case date.day() === DAY.Sunday:
      return date.subtract(2, "day")
    default:
      return date
  }
}

const calculatePaydayActual = (payday: dayjs.Dayjs) => {
  return isWeekendDay(payday) ? calculatePreviousWeekdayDate(payday) : payday
}

const calculateStats = (
  today: dayjs.Dayjs,
  payday: number
): {
  daysAhead: number
  workdaysAhead: number
  weekendsAhead: number
  isPaydayOnNextWeek: boolean
  isPaydayOnThisWeek: boolean
  isPaydayOnWeekend: boolean
  paydayOrigin: string
  paydayActual: string
} => {
  // TODO: need to account for payday date 31 but current month doesn't have date 31
  return {
    daysAhead: calculateDaysAhead(today, payday),
    workdaysAhead: calculateWorkdaysAhead(today, payday),
    weekendsAhead: calculateWeekendsAhead(today, payday),
    isPaydayOnNextWeek: isPaydayOnNextWeek(today, payday),
    isPaydayOnThisWeek: isPaydayOnThisWeek(today, payday),
    isPaydayOnWeekend: isWeekendDay(today.date(payday)),
    paydayOrigin: dayStringByIndex(today.date(payday).day()),
    paydayActual: dayStringByDate(calculatePaydayActual(today.date(payday))),
  }
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="p-8">{children}</div>
}

const Message: React.FC<{ workday: number }> = ({ workday }) => {
  switch (true) {
    case workday > 0:
      return (
        <div>
          Masih perlu kerja <strong>{workday}</strong> hari lagi!
        </div>
      )
    case workday <= 0:
      return <div className="text-teal-700 font-bold">Gajian</div>
    default:
      return <div>{errorString()}</div>
  }
}

const StatsWidget: React.FC<{ payday: number }> = ({ payday }) => {
  const today = React.useMemo(() => dayjs(), [])
  const stats = calculateStats(today, payday)
  return (
    <div>
      <div>{<Message workday={stats.workdaysAhead} />}</div>
    </div>
  )
}

type UninitializedState = null

type InitializedState = {
  payday: number
}

type State = UninitializedState | InitializedState

type StateManager = {
  state: State
  isInitialized: () => boolean
  setPayday: (payday: number) => void
  getPayday: () => number
}

type StateManagerParams = {
  payday?: number
}

const useStateManager = ({ payday }: StateManagerParams = {}): StateManager => {
  const initialState = payday ? { payday } : null
  const [state, setState] = React.useState<State>(initialState)
  const isInitialized = () => {
    // TODO: better checking
    return state !== null
  }
  const setPayday = (payday: number) => {
    setState({
      ...state,
      payday,
    })
  }
  const getPayday = () => {
    if (state && state.payday) {
      return state.payday
    } else {
      throw Error(
        `Can't get payday where it is supposed to has been initialized, typescript sucks!!!`
      )
    }
  }
  return {
    state,
    isInitialized,
    setPayday,
    getPayday,
  }
}

const InputWidget: React.FC<{
  payday?: number
  setPayday: StateManager["setPayday"]
}> = ({ payday, setPayday }) => {
  return (
    <div className="flex flex-row items-center justify-start">
      <div>Tanggal Gajian:</div>
      <div>
        <select
          value={payday}
          onChange={(e) => {
            const newValue = Number(e.target.value)
            if (!newValue || newValue < 1 || newValue > 31) return
            setPayday(newValue)
          }}
        >
          {range(31).map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

const Home: NextPage = () => {
  const stateManager = useStateManager()
  return (
    <>
      <Head>
        <title>Cepatlah Gajian</title>
        <meta name="description" content="Berharap cepat gajian" />
      </Head>

      <Layout>
        <InputWidget
          payday={
            stateManager.isInitialized() ? stateManager.getPayday() : undefined
          }
          setPayday={stateManager.setPayday}
        />
        {stateManager.isInitialized() && (
          <StatsWidget payday={stateManager.getPayday()} />
        )}
      </Layout>
    </>
  )
}

export default Home
