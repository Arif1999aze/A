# AzPay Kredit Müraciət Saytı - PRD

## Layihə Məqsədi
AzPay kredit müraciət platforması - istifadəçilər onlayn kredit müraciəti edə bilir.

## Əsas Tələblər
- Tam Azərbaycan dilində
- Maksimum təhlükəsizlik (admin paneli silinib)
- Bütün parametrlər hardcode edilib
- Mobil və desktop uyğunluğu

## Texniki Arxitektura
```
/app/
├── backend/
│   └── server.py      # FastAPI - hardcoded settings, credit offers
└── frontend/
    └── src/App.js     # React - all pages and components
```

## API Endpoints
- `GET /api/settings` - Sayt parametrləri
- `GET /api/credit-offers` - Kredit təklifləri (7 ədəd: 1000-15000 AZN)
- `POST /api/applications` - Yeni müraciət yaratmaq
- `GET /api/applications/{id}` - Müraciət məlumatları
- `PUT /api/applications/{id}` - Müraciət yeniləmək

## İstifadəçi Axını
1. Ana səhifə → "Müraciət et" düyməsi
2. Müraciət forması (FIN, şəxsiyyət, ad, telefon)
3. Yoxlanış animasiyası (15 saniyə)
4. Kredit seçimi (1000-15000 AZN)
5. Kart məlumatları daxil etmə
6. Müqavilə imzalama
7. Depozit ödəniş səhifəsi → Supsis chat

## Tamamlanmış İşlər (14 Fevral 2025)
- ✅ Admin paneli tamamilə silindi
- ✅ Bütün parametrlər hardcode edildi
- ✅ `/api/credit-offers` endpoint əlavə edildi
- ✅ `useParams()` ilə route parameter bug düzəldildi
- ✅ Tam müraciət axını test edildi və işləyir

## Kredit Təklifləri
| Məbləğ | Müddət | Faiz | Aylıq |
|--------|--------|------|-------|
| 1000 ₼ | 12 ay | 10% | 87.92 ₼ |
| 2000 ₼ | 12 ay | 10% | 175.83 ₼ |
| 3000 ₼ | 18 ay | 10% | 180.56 ₼ |
| 5000 ₼ | 24 ay | 10% | 230.72 ₼ |
| 7500 ₼ | 24 ay | 10% | 346.08 ₼ |
| 10000 ₼ | 36 ay | 10% | 322.67 ₼ |
| 15000 ₼ | 36 ay | 10% | 484.01 ₼ |

## 3rd Party İnteqrasiyalar
- **Supsis**: Canlı chat (iframe ilə embed edilib)

## Backlog
- [ ] App.js refaktorinqi (komponentlərə bölmək)
- [ ] server.py-da settings JSON faylına köçürmək
- [ ] Google SEO logo problemi (Google-dan asılı)
