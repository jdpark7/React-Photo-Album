// CommonFooter.tsx (패치 버전)
import { useEffect, useMemo, useState } from 'react'
import { useRecoilState, useRecoilValue, useRecoilValueLoadable } from 'recoil'
import { imageData } from '@/recoil/selectors/imageSelector'
import { pageState } from '@/recoil/atoms/pageState'
import styles from './CommonFooter.module.scss'
import { searchState } from '@/recoil/atoms/searchState'

function CommonFooter() {
  const imgSelector = useRecoilValueLoadable(imageData)
  const search = useRecoilValue(searchState)
  const [page, setPage] = useRecoilState(pageState)
  const [step, setStep] = useState(0) // 0-based 그룹 인덱스 (한 그룹 = 10페이지)

  // 검색어가 바뀌면 첫 그룹으로
  useEffect(() => { setStep(0) }, [search])

  // 1) totalPages 안전하게 계산 (total_pages | totalPages 둘 다 대응)
  const totalPages = useMemo(() => {
    if (imgSelector.state !== 'hasValue') return 0
    const c: any = imgSelector.contents
    const raw = c?.total_pages ?? c?.totalPages ?? 0
    return Number.isFinite(raw) ? Number(raw) : 0
  }, [imgSelector])

  // 2) 페이지 목록 [1..totalPages]
  const pages = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages]
  )

  // 3) 10개씩 그룹화 (비파괴적 slice)
  const groups = useMemo(() => {
    const g: number[][] = []
    for (let i = 0; i < pages.length; i += 10) g.push(pages.slice(i, i + 10))
    return g
  }, [pages])

  // totalPages 변동 시 step 경계 보정
  useEffect(() => {
    if (step >= groups.length) setStep(Math.max(0, groups.length - 1))
  }, [groups.length, step])

  const moveToPage = (selected: number) => setPage(selected)
  const moveToPrev = () => {
    if (step > 0) {
      setStep(s => s - 1)
      const prevGroupFirst = groups[step - 1]?.[0]
      if (prevGroupFirst) setPage(prevGroupFirst)
    }
  }
  const moveToNext = () => {
    if (step < groups.length - 1) {
      setStep(s => s + 1)
      const nextGroupFirst = groups[step + 1]?.[0]
      if (nextGroupFirst) setPage(nextGroupFirst)
    }
  }

  // 로딩/에러/빈 상태 처리: 필요시 푸터 숨김
  if (imgSelector.state === 'loading') {
    return null
  }
  if (imgSelector.state === 'hasError' || totalPages === 0 || groups.length === 0) {
    return null
  }

  const currentGroup = groups[step] ?? []

  return (
    <footer className={styles.footer}>
      <div className={styles.pagination}>
        <button className={styles.pagination__button} onClick={moveToPrev} disabled={step === 0}>
          <img src="/assets/icons/icon-arrowLeft.svg" alt="prev" />
        </button>

        {currentGroup.map((item) => (
          <button
            key={item}
            className={
              page === item
                ? `${styles.pagination__button} ${styles.active}`
                : `${styles.pagination__button} ${styles.inactive}`
            }
            onClick={() => moveToPage(item)}
          >
            {item}
          </button>
        ))}

        <button
          className={styles.pagination__button}
          onClick={moveToNext}
          disabled={step >= groups.length - 1}
        >
          <img src="/assets/icons/icon-arrowRight.svg" alt="next" />
        </button>
      </div>
    </footer>
  )
}

export default CommonFooter

