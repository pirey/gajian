import type { NextPage } from "next"
import Head from "next/head"
import React from "react"
import dayjs from "dayjs"

const DAYS = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 0,
}

const range = (n: number): number[] => Array.from(Array(n + 1).keys()).slice(1)

const calculateNumWeekends = (
  dateStart: dayjs.Dayjs,
  dateEnd: dayjs.Dayjs
): number => {
  const diffDay = dateEnd.diff(dateStart, "day")
  const nextDates = range(diffDay).map((numDay) => {
    return dateStart.add(numDay, "day")
  })
  return [dateStart, ...nextDates].filter((nextDate) =>
    [DAYS.Saturday, DAYS.Sunday].includes(nextDate.day())
  ).length
}

const calculateDiffWithoutWeekends = (
  dateStart: dayjs.Dayjs,
  dateEnd: dayjs.Dayjs
): number => {
  return (
    dateEnd.diff(dateStart, "day") - calculateNumWeekends(dateStart, dateEnd)
  )
}

const calculateWorkday = (today: dayjs.Dayjs, payday: number) => {
  const currentMonthPayday = today.date(payday)
  const nextMonthPayday = today.month(today.month() + 1).date(payday)
  if (today.isSame(currentMonthPayday)) {
    return 0
  } else if (today.isBefore(currentMonthPayday)) {
    return calculateDiffWithoutWeekends(today, currentMonthPayday)
  } else if (today.isAfter(currentMonthPayday)) {
    return calculateDiffWithoutWeekends(today, nextMonthPayday)
  } else {
    throw Error("Congratulations! The app crashed.")
  }
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      {children}
    </div>
  )
}

const CountdownWidget: React.FC<{ payday: number }> = ({ payday }) => {
  const workday = calculateWorkday(dayjs(), payday)
  return (
    <div className="text-center">
      <div className="text-xl">
        Tenang, cuma perlu kerja <strong>{workday}</strong> hari lagi!
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
