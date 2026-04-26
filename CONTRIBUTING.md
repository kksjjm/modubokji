# Contributing to 모두복지

모두복지에 기여해주셔서 감사합니다! 가장 큰 도움이 되는 것은 **복�� 정책 데이터 추가/수정**입니다.

## 정책 데이터 편집 가이드

### 파일 위치
`data/policies.json`

### 정책 데이터 구조

```json
{
  "id": "policy-id",
  "name": "정책 이름",
  "category": "카테고리",
  "description": "한 줄 설명",
  "eligibility_rules": [...],
  "benefits": "혜택 설명",
  "estimated_amount": "예상 금액",
  "required_documents": [...],
  "application_steps": [...],
  "incompatible_policies": [],
  "deadline": null,
  "source_url": "https://...",
  "last_verified": "2024-03-01",
  "status": "active"
}
```

### 카테고리 종류
- `기초생활` - 기초생활보장
- `주거` - 주거 지원
- `의료` - 의료 지원
- `교육` - 교육 지원
- `고용` - 고용/취업 지원
- `아동가족` - 아동/가족 지원
- `장애인` - 장애인 지원
- `노인` - 노인 지원
- `청년` - 청년 지원

### 자격 조건 규칙 (eligibility_rules)

각 규칙은 다음 형태입니다:
```json
{ "field": "필드명", "operator": "연산자", "value": 값, "required": true/false }
```

**필드 종류:**
| field | 설명 | 값 형태 |
|-------|------|---------|
| `age` | 나이 | 숫자 |
| `income_bracket` | 소득 구간 | 1~6 (아래 참조) |
| `household_type` | 가구 유형 | "단독", "부부", "한부모", "다자녀", "다인" |
| `region` | 거주 지역 | "서울", "경기" 등 |
| `disabilities` | 장애 여부 | "중증장애", "경증장애" |
| `life_situations` | 생활 상황 | "임신", "실업", "긴급위기", "영유아양육" |

**소득 구간:**
| 값 | 의미 |
|----|------|
| 1 | 기초생활 이하 (중위소득 30% 이하) |
| 2 | 차상위 (중위소득 40% 이하) |
| 3 | 중위소득 50% 이하 |
| 4 | 중위소득 100% 이하 |
| 5 | 중위소득 150% 이하 |
| 6 | 중위소득 150% 초과 |

**연산자:**
| operator | 설명 | 예시 |
|----------|------|------|
| `eq` | 같음 | `household_type` eq `"한부모"` |
| `in` | 배열에 포함 | `household_type` in `["단독","한부��"]` |
| `gte` | 이상 | `age` gte `65` |
| `lte` | 이하 | `income_bracket` lte `3` |
| `between` | 범위 | `age` between `[19, 34]` |
| `contains` | 포함 | `life_situations` contains `"임신"` |

### 비호환 정책 (incompatible_policies)

동시��� 받을 수 없는 정책의 ID를 배열로 입력합니다. **양쪽 모두에** 입력해야 합니다.

```json
// 정책 A
"incompatible_policies": ["policy-b"]

// 정책 B
"incompatible_policies": ["policy-a"]
```

### 데이터 검증

PR을 올리면 Zod 스키마 검증이 자동으로 실행됩니다. 로컬에서 미리 확���하려면:

```bash
npm test
```

### PR 체크리스트

- [ ] `id`가 기존 정책과 중복되지 않음
- [ ] `source_url`이 유효한 URL임
- [ ] `incompatible_policies`에 참조된 ID가 실제 존재함
- [ ] `application_steps`가 1개 이상 있음
- [ ] `last_verified` 날짜가 최신임
- [ ] `npm test`가 통과함

## 코드 기���

### 개발 환경 설정

```bash
git clone https://github.com/your-repo/modubokji.git
cd modubokji
npm install
npm run dev    # 개발 서버 (localhost:3000)
npm test       # 테스트 실행
npm run build  # 프로덕션 빌드
```

### 기술 스택
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Vitest (테스트)
- Zod (데이터 검증)
