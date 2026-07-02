# GTM 전환 설정 — 초보자용 단계별 가이드

이 문서는 **Google Tag Manager(GTM)에 GA4, Google Ads, Meta/Facebook Pixel 전환을 연결하는 방법**을 처음 하는 사람 기준으로 설명합니다.

핵심은 간단합니다.

1. 사이트 코드에는 **GTM 컨테이너 ID만** 넣습니다.
2. GTM 안에서 **GA4 / Google Ads / Meta Pixel 태그**를 만듭니다.
3. 사이트가 보내는 이벤트 이름을 기준으로 GTM이 태그를 실행합니다.

---

## 0. 먼저 이해해야 하는 단어

### GTM

Google Tag Manager입니다. 사이트 코드에 GA/Facebook Pixel을 각각 직접 넣지 않고, GTM 화면에서 태그를 관리하게 해주는 도구입니다.

### Tag

실제로 실행되는 추적 코드입니다.

예:

- GA4 page view 태그
- GA4 lead 이벤트 태그
- Google Ads 전환 태그
- Meta Pixel PageView 태그
- Meta Pixel Lead 태그

### Trigger

태그가 **언제 실행될지** 정하는 조건입니다.

예:

- 모든 페이지에서 실행
- 사용자가 CTA를 클릭했을 때 실행
- 계산기를 완료했을 때 실행

### Variable

이벤트에 딸려오는 값입니다.

예:

- 어떤 CTA를 눌렀는지: `landing_cta_id`
- 어떤 페이지에서 눌렀는지: `landing_path`
- 계산 결과가 위험인지 안전인지: `calculator_status`

---

## 1. 사이트에 GTM ID 넣기

Amplify 환경변수에 아래 값을 넣습니다.

```env
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

`GTM-XXXXXXX`는 GTM에서 만든 컨테이너 ID입니다.

확인 위치:

1. Google Tag Manager 접속
2. Workspace 화면 상단 확인
3. `GTM-`으로 시작하는 ID 복사

비워두면 GTM은 로드되지 않습니다.

---

## 2. 이 사이트가 GTM으로 보내는 이벤트

사이트 코드는 이미 아래 이벤트들을 `dataLayer`로 보냅니다.

| 이벤트 이름 | 언제 발생하나 | 광고/분석 용도 |
| --- | --- | --- |
| `landing_page_viewed` | 랜딩/블로그/계산기 페이지를 봤을 때 | 리마케팅 대상 만들기 |
| `landing_cta_clicked` | 무료 시작하기/베타 신청 CTA 클릭 | 핵심 전환 |
| `order_timing_calculated` | 발주 타이밍 계산기를 계산했을 때 | 계산기 관심 고객 측정 |
| `calculator_share_copied` | 계산기 공유 문구/링크를 복사했을 때 | 공유/바이럴 행동 측정 |

광고 시작 초기에는 **`landing_cta_clicked`를 메인 전환**으로 잡는 것을 추천합니다.

계산기 캠페인까지 돌릴 경우에는 **`order_timing_calculated`도 보조 전환**으로 보면 좋습니다.

---

## 3. GTM에서 Variables 만들기

GTM 왼쪽 메뉴에서:

```txt
Variables → User-Defined Variables → New
```

Variable Type은 모두:

```txt
Data Layer Variable
```

아래를 하나씩 만듭니다.

| Variable Name | Data Layer Variable Name |
| --- | --- |
| `DLV - landing_cta_id` | `landing_cta_id` |
| `DLV - landing_cta_label` | `landing_cta_label` |
| `DLV - activation_journey_id` | `activation_journey_id` |
| `DLV - landing_path` | `landing_path` |
| `DLV - utm_source` | `utm_source` |
| `DLV - utm_medium` | `utm_medium` |
| `DLV - utm_campaign` | `utm_campaign` |
| `DLV - calculator_status` | `calculator_status` |
| `DLV - calculator_share_key` | `calculator_share_key` |
| `DLV - days_left` | `days_left` |
| `DLV - days_until_reorder` | `days_until_reorder` |
| `DLV - recommend_qty` | `recommend_qty` |

처음에는 `landing_cta_id`, `landing_cta_label`, `landing_path`, `calculator_status` 정도만 만들어도 됩니다.

---

## 4. GTM에서 Triggers 만들기

GTM 왼쪽 메뉴에서:

```txt
Triggers → New
```

### 4-1. CTA 클릭 Trigger

이 Trigger가 가장 중요합니다.

- Trigger Type: `Custom Event`
- Event name:

```txt
landing_cta_clicked
```

- Trigger name:

```txt
CE - landing_cta_clicked
```

이 Trigger는 사용자가 다음 버튼을 눌렀을 때 실행됩니다.

- Header의 `카카오로 무료체험 시작하기`
- Home의 `카카오로 무료체험 시작하기`
- Home 하단의 `카카오로 무료체험 시작하기`
- 계산기의 `카카오로 무료체험 시작하기`

### 4-2. 계산기 완료 Trigger

- Trigger Type: `Custom Event`
- Event name:

```txt
order_timing_calculated
```

- Trigger name:

```txt
CE - order_timing_calculated
```

### 4-3. 계산기 공유 Trigger

- Trigger Type: `Custom Event`
- Event name:

```txt
calculator_share_copied
```

- Trigger name:

```txt
CE - calculator_share_copied
```

---

## 5. GA4 설정

### 5-1. 모든 페이지에 GA4 기본 태그 만들기

GTM 왼쪽 메뉴:

```txt
Tags → New
```

설정:

- Tag Type: `Google tag`
- Tag ID: GA4의 `G-XXXXXXXXXX`
- Trigger: `All Pages`
- Tag name:

```txt
GA4 - Google tag - All Pages
```

이 태그는 모든 페이지 방문을 GA4로 보냅니다.

### 5-2. CTA 클릭을 GA4 전환 이벤트로 보내기

GTM에서 새 태그를 만듭니다.

- Tag Type: `Google Analytics: GA4 Event`
- Configuration tag: 위에서 만든 GA4 Google tag 선택
- Event name:

```txt
generate_lead
```

Event parameters:

| Parameter Name | Value |
| --- | --- |
| `cta_id` | `{{DLV - landing_cta_id}}` |
| `cta_label` | `{{DLV - landing_cta_label}}` |
| `activation_journey_id` | `{{DLV - activation_journey_id}}` |
| `landing_path` | `{{DLV - landing_path}}` |
| `utm_source` | `{{DLV - utm_source}}` |
| `utm_medium` | `{{DLV - utm_medium}}` |
| `utm_campaign` | `{{DLV - utm_campaign}}` |

Trigger:

```txt
CE - landing_cta_clicked
```

Tag name:

```txt
GA4 - generate_lead - Landing CTA
```

### 5-3. 계산 완료를 GA4 이벤트로 보내기

새 태그를 만듭니다.

- Tag Type: `Google Analytics: GA4 Event`
- Event name:

```txt
order_timing_calculated
```

Event parameters:

| Parameter Name | Value |
| --- | --- |
| `calculator_status` | `{{DLV - calculator_status}}` |
| `calculator_share_key` | `{{DLV - calculator_share_key}}` |
| `days_left` | `{{DLV - days_left}}` |
| `days_until_reorder` | `{{DLV - days_until_reorder}}` |
| `recommend_qty` | `{{DLV - recommend_qty}}` |

Trigger:

```txt
CE - order_timing_calculated
```

Tag name:

```txt
GA4 - order_timing_calculated
```

### 5-4. GA4에서 전환으로 표시하기

GA4 화면에서:

```txt
Admin → Data display → Events
```

이벤트가 들어온 뒤 `generate_lead`를 key event로 지정합니다.

Google 공식 문서에 따르면 GA4에서는 원하는 이벤트를 만들거나 받은 이벤트를 key event로 지정할 수 있습니다. Google은 `page_view` 같은 전체 페이지뷰를 전환으로 만들기보다 별도 이벤트를 만들어 key event로 표시하는 방식을 안내합니다.

---

## 6. Google Ads 전환 설정

초보자에게는 아래 방식이 가장 쉽습니다.

### 추천 방식: GA4 전환을 Google Ads로 가져오기

1. GA4와 Google Ads를 연결합니다.
2. GA4에서 `generate_lead`를 key event로 표시합니다.
3. Google Ads에서 GA4 key event를 conversion으로 가져옵니다.

장점:

- GTM 설정이 단순합니다.
- GA4와 Google Ads 전환 수 차이가 줄어듭니다.

### 직접 Google Ads Conversion Tag를 쓰는 경우

GTM에서 새 태그를 만듭니다.

- Tag Type: `Google Ads Conversion Tracking`
- Conversion ID: Google Ads 전환 액션에서 복사
- Conversion Label: Google Ads 전환 액션에서 복사
- Trigger:

```txt
CE - landing_cta_clicked
```

그리고 반드시 Conversion Linker도 만듭니다.

- Tag Type: `Conversion Linker`
- Trigger: `All Pages`
- Tag name:

```txt
Google Ads - Conversion Linker - All Pages
```

Google 공식 문서에 따르면 Conversion Linker는 광고 클릭 정보를 쿠키/브라우저 저장소에 저장해서 전환이 어떤 광고 클릭에서 왔는지 연결하는 역할을 합니다. 대부분의 경우 All Pages에 붙이는 것을 권장합니다.

---

## 7. Meta/Facebook Pixel 설정

### 7-1. Meta Pixel 기본 태그 만들기

GTM에서 새 태그를 만듭니다.

- Tag Type: `Custom HTML`
- Trigger: `All Pages`
- Tag name:

```txt
Meta Pixel - Base - All Pages
```

HTML:

```html
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
```

`YOUR_PIXEL_ID`를 Meta Events Manager의 Pixel ID로 바꿉니다.

### 7-2. CTA 클릭을 Meta Lead로 보내기

새 태그를 만듭니다.

- Tag Type: `Custom HTML`
- Trigger:

```txt
CE - landing_cta_clicked
```

- Tag name:

```txt
Meta Pixel - Lead - Landing CTA
```

HTML:

```html
<script>
fbq('track', 'Lead', {
  content_name: 'landing_cta_clicked',
  content_category: 'activation',
  landing_cta_id: '{{DLV - landing_cta_id}}',
  landing_cta_label: '{{DLV - landing_cta_label}}',
  activation_journey_id: '{{DLV - activation_journey_id}}',
  landing_path: '{{DLV - landing_path}}'
});
</script>
```

중요:

- 이 태그는 Meta Pixel Base 태그가 먼저 로드되어야 안정적입니다.
- GTM의 Tag Sequencing에서 Base 태그를 먼저 실행하도록 설정하면 더 안전합니다.

### 7-3. 계산 완료를 Meta Custom Event로 보내기

선택 사항입니다. 계산기 캠페인을 강하게 돌릴 때 쓰면 좋습니다.

- Tag Type: `Custom HTML`
- Trigger:

```txt
CE - order_timing_calculated
```

HTML:

```html
<script>
fbq('trackCustom', 'OrderTimingCalculated', {
  calculator_status: '{{DLV - calculator_status}}',
  calculator_share_key: '{{DLV - calculator_share_key}}',
  days_left: '{{DLV - days_left}}',
  days_until_reorder: '{{DLV - days_until_reorder}}'
});
</script>
```

---

## 8. 초보자용 최소 설정 순서

처음부터 전부 하지 말고 아래 순서대로 하세요.

### 1단계 — GTM 설치 확인

- `NEXT_PUBLIC_GTM_ID` 설정
- 배포
- GTM Preview에서 사이트 연결 확인

### 2단계 — GA4만 먼저 연결

- `GA4 - Google tag - All Pages`
- `GA4 - generate_lead - Landing CTA`
- `GA4 - order_timing_calculated`

### 3단계 — Meta Pixel 연결

- `Meta Pixel - Base - All Pages`
- `Meta Pixel - Lead - Landing CTA`
- 선택: `OrderTimingCalculated` custom event

### 4단계 — Google Ads 연결

- 쉬운 방식: GA4 key event를 Google Ads로 import
- 직접 방식: Google Ads Conversion Tracking + Conversion Linker

---

## 9. 최종 검증 체크리스트

### GTM Preview에서 확인

1. `/` 접속
2. `landing_page_viewed` 이벤트가 보이는지 확인
3. CTA 클릭
4. `landing_cta_clicked` 이벤트가 보이는지 확인
5. 그 이벤트에서 아래 태그들이 Fired 되었는지 확인
   - `GA4 - generate_lead - Landing CTA`
   - `Meta Pixel - Lead - Landing CTA`
   - 선택: `Google Ads Conversion Tracking`
6. `/order-timing-calculator` 접속
7. 계산 실행
8. `order_timing_calculated` 이벤트가 보이는지 확인
9. 공유 버튼 클릭
10. `calculator_share_copied` 이벤트가 보이는지 확인

### GA4에서 확인

- Realtime 또는 DebugView에서 `generate_lead` 확인
- `order_timing_calculated` 확인
- Admin에서 `generate_lead`를 key event로 지정

### Meta에서 확인

- Events Manager → Test Events
- `PageView` 확인
- `Lead` 확인
- 선택: `OrderTimingCalculated` 확인

### Google Ads에서 확인

- Google Ads Conversion Diagnostics 확인
- 처음에는 “최근 전환 없음”으로 보일 수 있습니다.
- 태그 firing 자체는 GTM Preview와 Tag Assistant로 먼저 확인합니다.

---

## 10. 제가 최종 검증할 때 필요한 것

설정을 마친 뒤 아래 중 하나를 주세요.

1. GTM Preview 공유 링크
2. 또는 배포된 dev URL + GTM 컨테이너가 publish된 상태
3. 또는 GTM/GA4/Meta 화면 캡처

제가 확인할 항목:

- GTM 컨테이너가 실제 페이지에 로드되는지
- `dataLayer` 이벤트가 정확히 발생하는지
- CTA 클릭 시 GA4/Meta/Google Ads 태그가 Fired 되는지
- 계산기 계산 완료 이벤트가 발생하는지
- 개인정보성 값이 dataLayer에 들어가지 않는지
- GA4 DebugView / Meta Test Events에서 수신되는지
