import { useMemo, useState } from 'react'
import { useRecoilValueLoadable } from 'recoil'
import { imageData } from '@/recoil/selectors/imageSelector'
import CommonHeader from '@components/common/header/CommonHeader'
import CommonSearchBar from '@components/common/searchBar/CommonSearchBar'
import CommonNav from '@components/common/navigation/CommonNav'
import CommonFooter from '@components/common/footer/CommonFooter'
import Card from './components/Card'
import DetailDialog from '@components/common/dialog/DetailDialog'
import Loading from './components/Loading'
// CSS
import styles from './styles/index.module.scss'
import { CardDTO } from './types/card'

function index() {
  const imgSelector = useRecoilValueLoadable(imageData);
  const [imgData, setImgData] = useState<CardDTO>();
  const [open, setOpen] = useState(false);

  const CARD_LIST = useMemo(() => {
    if (imgSelector.state === 'loading') {
      return <Loading />;
    }
    if (imgSelector.state === 'hasError') {
      const err = imgSelector.contents as Error;
      return (
        <div style={{ color: 'crimson', padding: '12px' }}>
          요청 실패: {err.message}
        </div>
      );
    }
    // hasValue
    const payload = imgSelector.contents as { results?: CardDTO[] } | undefined;
    const results = Array.isArray(payload?.results) ? payload!.results : [];

    if (results.length === 0) {
      return <div style={{ padding: '12px' }}>표시할 이미지가 없습니다.</div>;
    }

    return results.map((card) => (
      <Card
        data={card}
        key={card.id}
        handleDialog={setOpen}
        handleSetData={setImgData}
      />
    ));
  }, [imgSelector]);

  return (
    <div className={styles.page}>
      <CommonHeader />
      <CommonNav />
      <div className={styles.page__contents}>
        <div className={styles.page__contents__introBox}>
          <div className={styles.wrapper}>
            <span className={styles.wrapper__title}>PhotoSplash</span>
            <span className={styles.wrapper__desc}>
              인터넷의 시각 자료 출처입니다. <br />
              모든 지역에 있는 크리에이터들의 지원을 받습니다.
            </span>
            <CommonSearchBar />
          </div>
        </div>
        <div className={styles.page__contents__imageBox}>{CARD_LIST}</div>
      </div>
      <CommonFooter />
      {open && <DetailDialog data={imgData} handleDialog={setOpen} />}
    </div>
  );
}

export default index
