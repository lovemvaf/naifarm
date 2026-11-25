# Kế hoạch và trạng thái triển khai NaiAI

## Phạm vi

Chỉ chatbot bubble góc dưới bên phải trang chủ và API/nguồn dữ liệu trực tiếp phục vụ chatbot. Widget AI hiện hữu trên các trang khác không nằm trong phạm vi thay đổi. Mục tiêu hackathon: khách mua tra lô/QR, nhà vườn nhận hướng dẫn số hóa và đăng bán, thanh niên hỗ trợ số; ưu tiên điện thoại và lời đáp có nguồn.

## Kiến trúc hiện tại

1. `NaiFarmHomeChat` cung cấp bubble, FAQ gợi ý, upload ảnh, xem trước, sessionStorage, Markdown, nguồn, thẻ ảnh/sản phẩm và ba mức zoom.
2. `POST /api/nai-ai/chat` xác thực loại/kích thước ảnh, xử lý QR bằng jsQR, giảm kích thước và dùng Gemini vision để mô tả ảnh. Nội dung ảnh chỉ là gợi ý đối chiếu, không chứng minh xuất xứ/chất lượng.
3. LangGraph supervisor phân loại qua Jev (`jev-1.14.0`, `TYPESAFE_API_KEY`) rồi định tuyến một nhánh chuyên biệt: traceability, marketplace, farmer guide, volunteer guide, livestream hoặc out-of-scope. Nếu API Jev lỗi, timeout, trả nhãn lạ hoặc confidence dưới 0.35, dùng intent router cục bộ.
4. Specialist truy vấn seed demo; khi cấu hình Supabase/Gemini, truy xuất vector cosine HNSW và PostgreSQL FTS. Gemini Embedding 2 dùng prefix asymmetric `task: search result | query: ...` và `title: ... | text: ...`; retrieval hợp nhất RRF rồi heuristic rerank theo entity, từ khóa và similarity. Marketplace/livestream tùy chọn tìm bằng Tavily và kèm trang nguồn HTTPS/ảnh tham khảo.
5. Evidence critic kiểm tra có bằng chứng trước khi tổng hợp. Nếu rỗng, query-refinement agent viết lại truy vấn bằng DeepSeek, specialist tìm lại tối đa một lần. Mã lô chính xác không có chứng cứ bị từ chối an toàn, không gửi sang LLM để đoán.
6. DeepSeek tổng hợp câu trả lời tiếng Việt từ context đã truy xuất. Không có lệnh ghi đơn hàng, xuất bản hay thanh toán. LangSmith tracing tùy chọn và ẩn input/output.
7. `nai:ingest` trích xuất TXT, MD, DOCX và PDF có text; chia đoạn có overlap, Gemini embed rồi upsert Supabase. `nai:sync:catalog` nạp catalog seed. `nai:eval:jev` đo bộ intent fixture. `nai:test` kiểm tra router/RRF/reranker và vòng retrieval.

## Đã triển khai

- Truy xuất nguồn catalog/hộ chiếu, FAQ khách mua W01, các vai trò supervisor/specialist/evidence critic/query refiner/synthesizer trong LangGraph, hybrid retrieval, rerank heuristic, Tavily search/image cards, Jev live routing và Jev fixture harness.
- Vòng agentic RAG giới hạn một lần viết lại truy vấn khi retrieval không có evidence; mã lô không khớp chính xác trả lời an toàn không tìm thấy.
- Nhập tài liệu TXT/MD/DOCX/PDF text, seed catalog demo, pgvector migration và UI home chat.
- Redaction mặc định của LangSmith trace; giới hạn payload Jev; fallback nếu provider ngoài gián đoạn.
- Catalog demo dùng mã lô riêng cho sản phẩm; không tự tạo nhật ký mùa vụ cho sản phẩm chưa có nhật ký.
- Đã rà ảnh chính dùng trong product cards: P05 dùng ảnh sầu riêng, P11 dùng ảnh có nhãn Mứt Vỏ Bưởi; mô tả P05 khớp mã lô `NF-DEMO-P05`.
- Chatbot mới chỉ được mount từ trang chủ; bỏ widget fallback ngoài phạm vi khỏi component mới.

## Giới hạn và trade-off cần giữ rõ

- Heuristic reranker rẻ và nhẹ nhưng kém cross-encoder khi nhiều tài liệu gần nghĩa. Có thể thay sau khi có bộ câu hỏi đánh giá và ngân sách latency.
- Multi-agent ở đây là các vai trò tuần tự do supervisor điều phối; chỉ một domain specialist chạy mỗi lượt, không có tranh luận hay retrieval song song giữa nhiều specialist. Vòng tự sửa truy vấn chỉ chạy tối đa một lần để giữ latency/chi phí.
- Tavily image chỉ là ảnh web tham khảo; kết quả tìm kiếm không xác nhận ảnh đúng sản phẩm, nguồn gốc, quyền sử dụng hoặc tính thời sự. Không hiển thị ảnh đó như ảnh sản phẩm NaiFarm đã xác thực.
- PDF scan không có OCR; cần chuyển OCR và duyệt nội dung trước khi ingest. PDF có text được hỗ trợ.
- Phiên chat lưu trên trình duyệt; chưa có tài khoản/lưu lịch sử server/đồng bộ thiết bị.
- API chat hiện chưa có xác thực hay rate limit dùng chung. Chỉ nên demo local/được bảo vệ; trước khi public cần thêm throttle phân tán theo user/IP và giới hạn ngân sách provider.
- Seed chỉ là dữ liệu minh họa. Nội dung người dùng đăng trong localStorage không tự đồng bộ Supabase. Chạy lại catalog sync sau khi thay seed.
- Supabase key dạng server secret cần quyền tối thiểu, không đưa vào client. Migration phải chạy thủ công ở project Supabase trước khi ingest.
- Khóa LangSmith từng xuất hiện trong output của phiên làm việc trước; người dùng xác nhận đã rotate và cập nhật `.env`. Không in hoặc chia sẻ giá trị khóa trong log, chat hay tài liệu.

## Todo và tiêu chí chấp nhận

### Code/local

- [x] Build home chat bubble với text/ảnh, FAQ gợi ý, session và zoom.
- [x] Đọc QR + Gemini vision; validate request multipart.
- [x] Router/specialist/synthesis LangGraph, fallback an toàn và system prompt domain.
- [x] Evidence critic, một lần query refinement/retrieval có giới hạn và guard mã lô chính xác không có bằng chứng.
- [x] Supabase pgvector + FTS hybrid retrieval, RRF/rerank, seed catalog sync.
- [x] Cosine RPC qualify pgvector operator trong schema `extensions` khi `search_path` rỗng; static regression assertion kiểm tra cả similarity và ORDER BY.
- [x] TXT/MD/DOCX/PDF text ingestion và Jev fixture harness.
- [x] Tavily search/images có nhãn tham khảo, nguồn HTTPS.
- [x] Test tự động không gọi provider thật: intent, RRF/rerank, LangGraph traceability, API text/ảnh, SVG bị từ chối và các contract mock cho Jev/Gemini/Supabase/Tavily/DeepSeek; xác nhận không có request mạng ngoài.
- [x] Câu hỏi danh tính “Bạn là ai?”, “Bạn tên gì?” và “NaiFarm là gì?” được trả lời trực tiếp là NaiAI, trợ lý NaiFarm; regression test xác nhận không gọi provider và không hiển thị markdown `**`.
- [x] Jev endpoint chỉ chấp nhận HTTPS; smoke test xác nhận URL HTTP rơi về router cục bộ mà không gửi request.
- [x] Mocked provider contract: Jev choice route và Jev eval harness 14 fixture, Gemini vision/embedding, DeepSeek completion, hai Supabase hybrid RPC, Tavily search/ảnh và LangSmith trace đi qua LangGraph/API; mọi fetch đều bị chặn tại test, không có request mạng thật.
- [x] LangSmith callback redaction giữ cấu trúc trace nhưng xóa input/output và nội dung lỗi ở mọi run, kể cả tracer con; mock payload kiểm tra marker bí mật ở câu hỏi, lịch sử, câu trả lời và lỗi provider đều vắng mặt.
- [x] Trình duyệt với API giả: gửi text/ảnh, mô phỏng lỗi 503 rồi retry; câu hỏi không bị nhân đôi, ảnh JPEG được gửi lại và câu trả lời phục hồi hiển thị.
- [x] `npm run typecheck`, router/RRF/reranker, mocked Jev/Tavily/API smoke và dry-run TXT/Markdown/DOCX/PDF đạt; PDF.js dùng standard fonts local. Trong sandbox, `tsx` bị `spawn EPERM`, nên dry-run bốn định dạng dùng Node native TypeScript. Lint chatbot 0 lỗi, 2 cảnh báo `<img>`.
- [x] Rà ảnh chính và mã lô trong seed; sửa hai ảnh không khớp sản phẩm và nội dung P05 còn dùng mã cũ. Cần chạy lại catalog sync khi Supabase khả dụng.
- [x] Trình duyệt local: mở bubble desktop/mobile; ở 390×844 đo panel 390×680/768/810 không tràn ngang; API trả 400 cho input trống/quá dài và 415 cho SVG; launcher có ở `/` và không xuất hiện tại `/marketplace`.
- [x] Sau khi rotate key, API local nhận truy vấn lô và ảnh nông sản với HTTP 200; ảnh hỏi chung được định tuyến marketplace. DeepSeek trả câu trả lời live; probe trực tiếp Jev HTTP 200, Gemini vision thành công, embedding 768 chiều và Tavily HTTP 200 (3 kết quả, 5 ảnh).
- [x] `npm run build` hoàn tất ngoài sandbox với Next.js 16.4.6: TypeScript, thu thập dữ liệu trang và prerender 30 trang đều đạt. Trong sandbox, worker bị `spawn EPERM`; build production đã được xác nhận bằng executable npm cục bộ ngoài sandbox.

### Môi trường có credentials và trình duyệt

- [x] Người dùng xác nhận rotate LangSmith key đã lộ. DeepSeek, Gemini, Tavily, Jev và Supabase REST credentials đã được probe live; Supabase chưa có bảng chatbot và chưa có RPC.
- [ ] Chạy migration và seed catalog trên Supabase; đối chiếu schema vector 768 với model/dimensions.
- [x] Jev live harness 14 fixture đạt 14/14 sau khi làm rõ tiêu chí nhãn; confidence trung bình 0.938. LangSmith agent environment `naifarm/local` đã nhận 22 runs trong cửa sổ 5 phút gần nhất qua API; tất cả run trả về đều rỗng input/output/error.
- [x] Browser thật trên home: câu hỏi “Bạn là ai?” mở đầu bằng “Mình là NaiAI, trợ lý ảo của NaiFarm”; câu hỏi tra lô hiển thị nguồn và sản phẩm demo. Zoom in/out lần lượt đổi khung từ 390×620 lên 500×760.
- [x] Ảnh PNG QR gửi qua API local được đọc thành mã `NF-DEMO-001`, route `traceability`, source `/trace/NF-DEMO-001` và một product card.
- [x] Sau khi thêm evidence critic/query refinement: API thật trả nguồn và product card cho `NF-DEMO-001`; mã `NF-UNKNOWN-999` bị từ chối suy đoán. Câu hỏi nhà vườn không có tài liệu trả lời an toàn sau một vòng truy vấn bổ sung; LangSmith cho thấy run `query_refinement_agent` và vẫn redacted payload.
- [x] FAQ nhận hàng/phí giao trên API thật trả nguồn `/cart`, mức phí demo 20.000 đ và không kèm product card không liên quan.
- [x] Câu hỏi gợi ý “Thanh niên hỗ trợ nhà vườn ra sao?” được ánh xạ về nhiệm vụ W03 phù hợp và nguồn `/volunteer`; regression test xác nhận câu trả lời lấy đúng FAQ.
- [x] API thật nhận câu hỏi gợi ý W03, Jev route `volunteer_guide`, câu trả lời nhắc nhiệm vụ `NF-MIS-03` và nguồn `/volunteer`; trace `volunteer_agent` được ghi mà payload vẫn redacted.
- [x] Browser keyboard: Enter gửi câu hỏi. Khi giả lập offline, chatbot giữ câu người dùng, hiển thị “Failed to fetch” và nút thử lại; sau khi khôi phục mạng, thử lại trả câu trả lời và xóa trạng thái lỗi.
- [ ] Tavily có kết quả thật nhưng cần duyệt ảnh/nguồn và quyền sử dụng trước demo; xác nhận các ảnh thật được render đúng trong giao diện.
- [ ] Kiểm tra riêng ảnh Tavily và quyền sử dụng trước buổi demo; xác nhận mọi sản phẩm/ảnh demo khớp thẻ.

## Cách chạy local

Xem [RUNBOOK.md](./RUNBOOK.md). Người dùng đã xác nhận rotate khóa LangSmith bị lộ; không in hoặc chia sẻ khóa. Không chạy OCR trên tài liệu chưa được duyệt.

### LangSmith/local database follow-up

- [x] Fix LangSmith routing to honor `LANGSMITH_AGENT_ID` plus `LANGSMITH_AGENT_ENVIRONMENT`; remove the legacy project override. Offline trace contract confirms destination `naifarm/local` and redacted payload.
- [x] Apply the document migration to a disposable network-disabled local Supabase PostgreSQL instance; vector and FTS RPC smoke queries each returned one row.
- [x] After rotation, graph-routed requests created live traces at `naifarm/local`; the latest read-only LangSmith API query found 22 runs in five minutes, including the live W03 `volunteer_agent`, and confirmed every run has empty inputs/outputs and no error text. A separate live query-refinement request produced a `query_refinement_agent` run.
- [ ] Live Supabase REST credentials authenticate, but PostgREST returns `PGRST205` for `nai_documents` and `PGRST202` for both retrieval RPCs. The user selected the SQL Editor path and will run the migration; no live schema/data has been changed by this implementation.

### Kiểm tra hồi quy danh tính (2026-11-25)

- [x] Chuẩn hóa tiền tố chào hỏi và câu dẫn lịch sự trước khi nhận diện câu hỏi danh tính, vì vậy “hello bạn là ai”, “Hi, bạn là ai vậy?” và “Xin chào, bạn là ai?” đều được giới thiệu là NaiAI; câu hỏi tìm sản phẩm có lời chào vẫn đi qua router marketplace.
- [x] API production local tại `127.0.0.1:3100` trả HTTP 200 cho “hello bạn là ai”, với câu trả lời mở đầu “Mình là NaiAI, trợ lý ảo của NaiFarm…”, không gọi provider và không kèm nguồn/card không liên quan.
- [ ] Không thể chạy lại bộ flow test và typecheck trên working tree hiện tại: các merge-conflict marker đang tồn tại trong `src/data/demo/batches.ts`, `src/data/demo/products.ts`, `src/app/layout.tsx`, `src/app/live/page.tsx`, `src/components/navigation/AppHeader.tsx`, `package.json` và `package-lock.json`. Lint riêng hai file chatbot đã đạt; cần xử lý các conflict này để khôi phục kiểm tra toàn dự án.
