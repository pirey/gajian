import type { NextPage } from "next"
import Head from "next/head"
import React from "react"
import dayjs from "dayjs"
import weekOfYear from "dayjs/plugin/weekOfYear"

dayjs.extend(weekOfYear)

enum DAY {
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
  Sunday = 0,
}

const dayStringFromIndex = (dayIndex: DAY) => {
  const dayMap = {
    [DAY.Monday]: "Senin",
    [DAY.Tuesday]: "Selasa",
    [DAY.Wednesday]: "Rabu",
    [DAY.Thursday]: "Kamis",
    [DAY.Friday]: "Jumat",
    [DAY.Saturday]: "Sabtu",
    [DAY.Sunday]: "Minggu",
  }
  return dayMap[dayIndex]
}

const dayStringFromDate = (date: dayjs.Dayjs) => {
  return dayStringFromIndex(date.day())
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
  const paydayDate = today.date(payday)

  const onThisWeek =
    today.isBefore(paydayDate) && today.week() === paydayDate.week()

  const onSundayNextWeek =
    today.isBefore(paydayDate) &&
    today.week() + 1 === paydayDate.week() &&
    paydayDate.day() === DAY.Sunday

  return onThisWeek || onSundayNextWeek
}

const isPaydayOnNextWeek = (today: dayjs.Dayjs, payday: number): boolean => {
  const paydayDate = today.date(payday)

  const onNextWeek =
    today.isBefore(paydayDate) &&
    today.week() + 1 === paydayDate.week() &&
    paydayDate.day() !== DAY.Sunday

  const onSundayTwoWeeksAhead =
    today.isBefore(paydayDate) &&
    today.week() + 2 == paydayDate.week() &&
    paydayDate.day() === DAY.Sunday

  return onNextWeek || onSundayTwoWeeksAhead
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

const calculateActualPayday = (payday: dayjs.Dayjs): dayjs.Dayjs => {
  return isWeekendDay(payday) ? calculatePreviousWeekdayDate(payday) : payday
}

const isDateBetween = (
  dateStart: dayjs.Dayjs,
  dateEnd: dayjs.Dayjs,
  date: dayjs.Dayjs
): boolean => {
  return (
    (date.isSame(dateStart) || date.isAfter(dateStart)) &&
    (date.isSame(dateEnd) || date.isBefore(dateEnd))
  )
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
  isPayday: boolean
  isWeekendToday: boolean
  paydayOriginDate: dayjs.Dayjs
  paydayActualDate: dayjs.Dayjs
  paydayOriginString: string
  paydayActualString: string
} => {
  // TODO: need to account for payday date 31 but current month doesn't have date 31
  const paydayOriginDate = today.date(payday)
  const paydayActualDate = calculateActualPayday(today.date(payday))
  const isPayday = isDateBetween(paydayActualDate, paydayOriginDate, today)
  return {
    daysAhead: calculateDaysAhead(today, payday),
    workdaysAhead: calculateWorkdaysAhead(today, payday),
    weekendsAhead: calculateWeekendsAhead(today, payday),
    isPaydayOnNextWeek: isPaydayOnNextWeek(today, payday),
    isPaydayOnThisWeek: isPaydayOnThisWeek(today, payday),
    isPaydayOnWeekend: isWeekendDay(today.date(payday)),
    isPayday,
    isWeekendToday: isWeekendDay(today),
    paydayOriginDate,
    paydayActualDate,
    paydayOriginString: dayStringFromIndex(today.date(payday).day()),
    paydayActualString: dayStringFromDate(
      calculateActualPayday(today.date(payday))
    ),
  }
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="flex flex-col h-screen w-screen">{children}</div>
}

const StatsWidget: React.FC<{
  today: dayjs.Dayjs
  payday: number
  verbose: boolean
  debug: boolean
}> = ({ today, payday, verbose = false, debug = false }) => {
  const stats = calculateStats(today, payday)

  const message = (() => {
    switch (true) {
      case stats.isPayday: {
        const isAdvanced =
          !stats.isWeekendToday &&
          stats.paydayActualString !== stats.paydayOriginString
        const showAltMessage = verbose && isAdvanced
        return (
          <div className="text-2xl text-teal-700 font-extrabold uppercase">
            {showAltMessage ? (
              <>
                Karena {stats.paydayOriginString} hari libur, jadi sekarang
                sudah <div className="animate-gajian">Gajian</div>
              </>
            ) : (
              <div className="animate-gajian">Gajian</div>
            )}
          </div>
        )
      }
      case stats.isPaydayOnThisWeek: {
        const isTomorrow = stats.daysAhead === 1
        const isAdvanced = stats.paydayActualString !== stats.paydayOriginString
        const showAltMessage = verbose && isAdvanced
        return (
          <div className="text-2xl text-teal-700 font-extrabold uppercase">
            {showAltMessage
              ? `Karena ${
                  stats.paydayOriginString
                } hari libur, gajian dimajukan besok ${
                  isTomorrow ? "" : stats.paydayActualString
                }`
              : `Besok ${isTomorrow ? "" : stats.paydayActualString} gajian`}
          </div>
        )
      }
      case stats.isPaydayOnNextWeek: {
        const isAdvanced = stats.paydayActualString !== stats.paydayOriginString
        const showAltMessage = verbose && isAdvanced
        return (
          <div className="text-2xl text-teal-700 font-extrabold uppercase">
            {showAltMessage &&
              `Karena ${stats.paydayOriginString} hari libur, gajian dimajukan hari ${stats.paydayActualString} di minggu depan!`}
            {!showAltMessage && `${stats.paydayActualString} depan gajian`}
          </div>
        )
      }
      case stats.workdaysAhead > 0:
        return verbose ? (
          <div className="text-2xl uppercase font-extrabold">
            Gajian masih <strong>{stats.daysAhead}</strong> hari,{" "}
            {stats.daysAhead !== stats.workdaysAhead &&
              `Tapi cuma perlu kerja ${stats.workdaysAhead} hari lagi!`}
          </div>
        ) : (
          <div className="text-2xl uppercase font-extrabold">Masih lama...</div>
        )
      default:
        return (
          <div className="text-2xl text-red-600 font-extrabold">
            {errorString()}
          </div>
        )
    }
  })()
  return (
    <div className="p-8 flex-grow flex flex-col items-center justify-center">
      {verbose && (
        <div>
          Sekarang hari <strong>{dayStringFromDate(today)}</strong> tanggal{" "}
          <strong>{today.date()}</strong>
        </div>
      )}
      <div className="text-center">{message}</div>
      {debug && (
        <pre className="text-left mt-12">{JSON.stringify(stats, null, 4)}</pre>
      )}
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
  setState: React.Dispatch<React.SetStateAction<State>>
  isInitialized: () => boolean
  setPayday: (payday: number) => void
}

const useStateManager = (initialState: State): StateManager => {
  const [state, setState] = React.useState<State>(initialState)
  const isInitialized = () => {
    return state !== null
  }
  const setPayday = (payday: number) => {
    const newState = { ...state, payday }
    setState(newState)
    window.localStorage.setItem(STATE_KEY, JSON.stringify(newState))
  }

  React.useEffect(() => {
    setState(initialState)
  }, [initialState])

  return {
    state,
    setState,
    isInitialized,
    setPayday,
  }
}

const InputWidget: React.FC<{
  payday?: number
  setPayday: StateManager["setPayday"]
}> = ({ payday, setPayday }) => {
  return (
    <div className="flex flex-col justify-center items-center bg-teal-600 p-8">
      <div className="flex flex-row items-center justify-start">
        <div className="uppercase font-extrabold text-2xl text-white">
          Tanggal Gajian:
        </div>
        <div className="border-2 rounded radius ml-4 w-16">
          <select
            className="w-full text-center font-bold"
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
    </div>
  )
}

const STATE_KEY = "STATE"

const useLoadedState = () => {
  const [state, setState] = React.useState<State>(null)
  React.useEffect(() => {
    try {
      const retrieved = window.localStorage.getItem(STATE_KEY)
      setState(retrieved ? JSON.parse(retrieved) : null)
    } catch (error) {
      setState(null)
    }
  }, [])
  return state
}

const useDebug = () => {
  const [debug, setDebug] = React.useState(false)
  React.useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    setDebug(queryParams.has("debug"))
  }, [])
  return debug
}

const useVerbose = () => {
  const [verbose, setVerbose] = React.useState(false)
  React.useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    setVerbose(queryParams.has("verbose"))
  }, [])
  return verbose
}

const Home: NextPage = () => {
  // const today = React.useMemo(() => dayjs().date(5), [])
  const today = React.useMemo(() => dayjs(), [])
  const state = useLoadedState()
  const stateManager = useStateManager(state)
  const debug = useDebug()
  const verbose = useVerbose()

  return (
    <>
      <Head>
        <title>Cepatlah Gajian</title>
        <meta name="description" content="Berharap cepat gajian" />
      </Head>

      <Layout>
        <InputWidget
          payday={stateManager.state?.payday}
          setPayday={stateManager.setPayday}
        />
        {stateManager.state?.payday && (
          <StatsWidget
            today={today}
            payday={stateManager.state.payday}
            verbose={verbose}
            debug={debug}
          />
        )}
      </Layout>
    </>
  )
}

export default Home
