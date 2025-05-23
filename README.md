# Vue 3 + TypeScript + Vite

## Proje Linkleri

-  **Canlı Demo:** [https://reservation-management-panel.vercel.app/](https://reservation-management-panel.vercel.app/)
-  **GitHub:** [https://github.com/Sezgincabbar/reservation-management-panel.git](https://github.com/Sezgincabbar/reservation-management-panel.git)

Bu proje, Vue 3, TypeScript ve Vite kullanılarak oluşturulmuştur. Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları takip edebilirsiniz.

## Kurulum

1. **Depoyu klonlayın:**

   ```bash
   git clone https://github.com/Sezgincabbar/reservation-management-panel.git
   cd reservation-management-panel
   ```

2. **Bağımlılıkları yükleyin:**

   ```bash
   npm install
   # veya
   yarn install
   ```

3. **Projeyi başlatın:**

   ```bash
   npm run dev
   # veya
   yarn dev
   ```

4. **Projeye tarayıcıdan erişin:**

   Çıktıdaki yerel adresi (genellikle http://localhost:5173) tarayıcınızda açın.

## API Kullanımı ve Sayfalama Hakkında

Projede, aşağıdaki gibi filtreli ve sayfalama (pagination) destekli API istekleri yapılabilmektedir:

```
GET https://682c1d4dd29df7a95be587f9.mockapi.io/api/v1/reservations?page=1&limit=3&status=1&hotel_id=2&sortBy[key]=total_fee&sortBy[order]=asc&order=asc
```

Bu istek ile belirli filtreler ve sıralama parametreleriyle veri çekilebilmektedir. Ancak, API'den dönen yanıtta toplam kayıt sayısı (örneğin `totalCount`) bilgisi bulunmamaktadır. Bu nedenle, gerçek anlamda bir sayfalama (pagination) yapılamamaktadır. Sadece mevcut sayfada dönen veri kadar kayıt gösterilebilmektedir.

> **Not:** API'den dönen örnek veri:
>
> ```json
> [
>   {"createdAt":"2025-05-20T16:21:47.627Z","name":"Salvador","surname":"Grady","start_date":"2025-03-13","end_date":"2025-03-16","total_fee":"668.59","status":1,"hotel_id":2,"id":"3"},
>   {"createdAt":"2025-05-20T19:13:17.909Z","name":"Ethelyn","surname":"Cassin","start_date":"2025-04-01","end_date":"2025-04-21","total_fee":"664.79","status":1,"hotel_id":2,"id":"4"},
>   {"createdAt":"2025-05-20T08:07:46.138Z","name":"Zelda","surname":"Turner","start_date":"2025-06-03","end_date":"2025-06-19","total_fee":"713.39","status":1,"hotel_id":2,"id":"5"}
> ]
>
> Görüldüğü gibi, toplam kayıt sayısı bilgisi yer almamaktadır.
> ```

## Ekstra Bilgi

-  Projede uygulanan filtreler `sessionStorage` üzerinde saklanmaktadır. Böylece sayfa yenilendiğinde veya kullanıcı geri geldiğinde filtreler korunur.
-  Uygulamada hata yönetimi için Error Boundary (Hata Sınırları) kullanılmıştır. Bu sayede beklenmeyen hatalar kullanıcıya düzgün bir şekilde gösterilir ve uygulamanın tamamı çökmez.
-  Performansı artırmak için bileşenlerde lazy load (tembel yükleme) yöntemi uygulanmıştır. Bu sayede sadece ihtiyaç duyulan bileşenler yüklenir ve başlangıç yükleme süresi kısalır.
