# chunking-query-db
Test performance if chunking query with MongoDB

Problem: Repo này dùng để giải quyết vấn đề về việc tính toán thống kê số lượng tin nhắn theo bot trong một hệ thống chatbot. Mình sẽ mô phỏng việc thống kê trong vòng 1 ngày, với số lượng bot < 1000, số lương tin nhắn > 1 triệu.

Mình sẽ giải quyết vấn đề trên bằng 4 cách, và sẽ dần tối ưu để đạt được kết quả mong muốn với hiệu năng tốt nhất.

- Cách 1:
    - Mình sẽ query tất cả data từ DB sau đó chạy một vòng lặp để tính số tin nhắn theo mỗi bot.
    - Và kêt quả là `DB high load` > 100% và node app cũng bị `heap out of memory` sau đó `crash`.
    - Đơn giản là vì số lượng tin nhắn quá lớn để có thể load hết lên memory để lưu trữ và xử lý.
    - Source code api `/get-without-chunk`
- Cách 2:
    - Mình nghĩ là việc query một lần hết làm cho DB high load, nên mình quyết định sẽ lấy theo từng chunk 1000 documents và hi vọng kết quả sẽ tốt hơn
    - Và đúng như mình nghĩ *DB* đã không còn gặp tình trạng high load nên api này cũng không ảnh hưởng đến các query khác cùng đến DB trong thời điểm này, nhưng node app của mình vẫn gặp tình trạng cũ là `heap out of memory`.
    - Source code api `/get-with-chunk-in-wrong-way`
- Cách 3:
    - Lần này mình sẽ xử lý việc tính toán tin nhắn theo bot trong mỗi chunk get được từ DB thay vì dồn hết đến khi get được tất cả tin nhắn việc này sẽ giúp mình giải phóng được memory đáng kể vì sau mỗi lần tính toán thì memory dùng để lưu từng chunk tin nhắn đó sẽ được `release`.
    - Kết quả đúng như mình mong đợi, `CPU` vẫn hoạt động hết công suất và api trả về kết quả như mong muốn, không gặp lỗi nào về memory.
    - Source code api `/get-with-chunk`
- Cách 4:
    - Cuối cùng, đây vốn là việc optimize `Cách 3` thì đúng hơn, vì mình không thay đổi gì logic cũ, chỉ là làm nó chạy nhanh hơn, với `Cách 3` thì cần tới 30s để xử lý xong, mình nhận thấy ở đây vẫn có một lượng resource bị lãng phí, đó chính là những properties không cần thiết trong data trả về từ DB, mình chỉ cần đúng field `botId` để tính toán thôi, việc lấy tất cả các properties sẽ rất tốn băng thông và gây ra độ trễ lớn.
    - Kết quả là thời gian phản hồi giảm 3 lần từ 30s -> 10s.
    - Source code api `/get-with-chunk-optimize`

