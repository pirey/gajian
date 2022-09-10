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

const calculateWorkdayBetweenDatesWithoutWeekends = (
  dateStart: dayjs.Dayjs,
  dateEnd: dayjs.Dayjs
): number => {
  return (
    dateEnd.diff(dateStart, "day") -
    calculateWeekendsBetweenDates(dateStart, dateEnd)
  )
}

const calculateWorkdaysAhead = (today: dayjs.Dayjs, payday: number): number => {
  const currentMonthPayday = today.date(payday)
  const nextMonthPayday = today.month(today.month() + 1).date(payday)

  switch (true) {
    case today.isSame(currentMonthPayday):
      return 0
    case today.isBefore(currentMonthPayday):
      return calculateWorkdayBetweenDatesWithoutWeekends(
        today,
        currentMonthPayday
      )
    case today.isAfter(currentMonthPayday):
      return calculateWorkdayBetweenDatesWithoutWeekends(today, nextMonthPayday)
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
  workdayAhead: number
  weekendsAhead: number
  isPaydayOnNextWeek: boolean
  isPaydayOnThisWeek: boolean
  isPaydayOnWeekend: boolean
  paydayOrigin: string
  paydayActual: string
} => {
  return {
    workdayAhead: calculateWorkdaysAhead(today, payday),
    weekendsAhead: calculateWeekendsAhead(today, payday),
    isPaydayOnNextWeek: isPaydayOnNextWeek(today, payday),
    isPaydayOnThisWeek: isPaydayOnThisWeek(today, payday),
    isPaydayOnWeekend: isWeekendDay(today.date(payday)),
    paydayOrigin: dayStringByIndex(today.date(payday).day()),
    paydayActual: dayStringByDate(calculatePaydayActual(today.date(payday))),
  }
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      {children}
    </div>
  )
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
      return <div>Gajian</div>
    default:
      return <div>{errorString()}</div>
  }
}

const CountdownWidget: React.FC<{ payday: number }> = ({ payday }) => {
  const today = React.useMemo(() => dayjs(), [])
  const stats = calculateStats(today, payday)
  return (
    <div className="text-center">
      <div className="text-xl">
        {!Number.isNaN(stats.workdayAhead) && (
          <Message workday={stats.workdayAhead} />
        )}
      </div>
    </div>
  )
}

const Home: NextPage = () => {
  const payday = 25
  return (
    <>
      <Head>
        <title>Cepatlah Gajian</title>
        <meta name="description" content="Berharap cepat gajian" />
      </Head>

      <Layout>
        <CountdownWidget payday={payday} />
      </Layout>
    </>
  )
}

export default Home
