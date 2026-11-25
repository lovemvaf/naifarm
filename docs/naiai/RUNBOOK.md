# Chạy NaiAI cục bộ

## Cấu hình

Tạo hoặc dùng Supabase project, chạy các migration NaiAI `202611250001_nai_documents.sql` và `202611250005_nai_documents_permissions.sql`. Migration đầu tạo pgvector/FTS; migration sau thu hồi quyền từ `public`, `anon`, `authenticated`, chỉ cấp truy cập bảng và RPC cho `service_role`. Dùng `SUPABASE_URL` và `SUPABASE_SECRET_KEY` từ `.env` cục bộ. Giữ secret key trong môi trường server. Không đổi khóa database hoặc model thành biến `NEXT_PUBLIC_`.

Cấu hình API ở `.env` được đọc phía server. `DEEPSEEK_API_KEY` tạo câu trả lời; `GEMINI_API_KEY` dùng cho vision và embedding; `TYPESAFE_API_KEY` định tuyến intent qua Jev; `TAVILY_API_KEY` bật web search/ảnh tham khảo; LangSmith tracing cần `LANGSMITH_API_KEY`, `LANGSMITH_TRACING=true`, `LANGSMITH_ENDPOINT=https://api.smith.langchain.com`, `LANGSMITH_AGENT_ID=naifarm` và `LANGSMITH_AGENT_ENVIRONMENT=local`. Sau khi sửa `.env`, khởi động lại Next.js server rồi gửi một câu nghiệp vụ mới như `Tra lô NF-DEMO-001`; câu danh tính được trả lời trực tiếp nên không tạo graph trace. Traces được gửi vào agent address `naifarm/local`; callback LangSmith tùy biến giữ cấu trúc, tên node và thời gian nhưng gửi input/output rỗng và thông báo lỗi đã khử nội dung. Supabase dùng `SUPABASE_URL` và `SUPABASE_SECRET_KEY`. `SUPABASE_PUBLISHABLE_KEY` hiện không dùng vì không có truy vấn Supabase từ trình duyệt. Khi thiếu Supabase/Gemini embedding, chatbot vẫn dùng seed. Khi thiếu DeepSeek, có FAQ/demo fallback. Khi Jev lỗi, router quy tắc tiếp tục chạy.

Khóa LangSmith từng xuất hiện trong output của phiên làm việc trước; người dùng đã xác nhận rotate và cập nhật `.env`. Không chia sẻ hoặc in bất kỳ giá trị khóa nào vào log/chat/tài liệu. Nếu một khóa khác bị lộ về sau, rotate khóa đó trước khi gọi provider.

Query dùng format `task: search result | query: ...`; document dùng `title: ... | text: ...` theo hướng dẫn asymmetric retrieval cho Gemini Embedding 2. Sau khi đổi model, prefix hoặc chiều vector, chạy lại `npm run nai:sync:catalog` và ingest lại toàn bộ tài liệu để không trộn embedding cũ/mới trong index. Đổi chiều vector phải đồng thời đổi `GEMINI_EMBEDDING_DIMENSIONS`, schema `vector(768)` và toàn bộ embedding đã nhập.

## Chạy và kiểm tra

1. Chạy `npm run dev`.
2. Mở `http://localhost:3000` và bấm bubble phía dưới bên phải.
3. Chọn ba câu hỏi gợi ý. Kiểm tra câu trả lời và link nguồn.
4. Chụp QR mẫu `NF-DEMO-001`, chọn ảnh rõ, bấm gửi, mở link hộ chiếu.
5. Thử tệp PDF hoặc GIF để xác nhận UI/API từ chối ảnh sai loại.
6. Chạy `npm run typecheck`, `npm run lint` và `npm run build`.

## Nhập tri thức demo

Chạy migration trước khi nhập.

```powershell
npm run nai:ingest -- .\documents\huong-dan.md --dry-run
npm run nai:ingest -- .\documents\huong-dan.md
npm run nai:ingest -- .\documents\quy-trinh.docx --dry-run
npm run nai:ingest -- .\documents\quy-trinh.pdf
npm run nai:sync:catalog -- --dry-run
npm run nai:sync:catalog
npm run nai:eval:jev
npm run nai:test
```

Ingest nhận TXT, Markdown, DOCX và PDF có lớp text. PDF scan cần OCR được kiểm duyệt trước khi nhập. `--dry-run` kiểm tra định dạng, trích text và chia đoạn. Đồng bộ catalog lấy sản phẩm, nhà vườn, hộ chiếu, livestream và FAQ từ seed hiện tại. Chạy lại sau khi sửa seed. Nội dung đăng trong `localStorage` không tự đồng bộ lên Supabase.

Jev fixture lưu tại `docs/naiai/jev-fixtures.json`; chạy script chỉ sau khi thay key. Kết quả là accuracy/confidence trên fixture có nhãn, không đại diện toàn bộ câu hỏi thật. Luồng chat gọi Jev một lần để chọn agent, gửi câu hỏi đã giới hạn và khử email/số điện thoại; không gửi lịch sử hoặc ảnh.

`npm run nai:test` không dùng credential provider thật. Smoke test đặt khóa giả và chặn toàn bộ `fetch`, rồi kiểm tra graph/API text/ảnh, Jev choice và harness trên 14 fixture, Gemini vision/embedding, hai RPC Supabase, Tavily search/ảnh, DeepSeek completion, LangSmith trace không chứa input/output, từ chối SVG và fallback khi Jev URL dùng HTTP. Không có request mạng ra ngoài. Lệnh cần Node 22.15 trở lên do dùng `node:module.registerHooks` để giải alias TypeScript trong smoke test.

Tavily chỉ chạy trong nhánh tìm sản phẩm hoặc livestream. Ảnh web được gắn nhãn tham khảo, cần người kiểm tra nguồn, đúng sản phẩm và quyền sử dụng trước demo. Hybrid retrieval kết hợp cosine/HNSW + PostgreSQL FTS, RRF rồi rerank heuristic (khớp mã, từ khóa, similarity); chưa dùng cross-encoder. Session nằm ở `sessionStorage`, không đồng bộ server.

## LangSmith agent tracing

The graph callback uses the configured `LANGSMITH_AGENT_ID` and `LANGSMITH_AGENT_ENVIRONMENT` destination. Do not set `LANGSMITH_PROJECT` or `LANGCHAIN_PROJECT` alongside agent addressing: a project destination overrides or conflicts with the agent route. The callback redacts run inputs, outputs, and error content before transmission. A local offline contract test verifies that the trace payload targets `naifarm/local` and contains no question/history/answer/error markers. For live confirmation, restart Next.js and submit a graph-routed query such as `Tra lô NF-DEMO-001`, then open the NaiFarm agent's Local tracing view.

The NaiAI migrations `202611250001_nai_documents` and `202611250005_nai_documents_permissions` are applied to the configured Supabase project. The server-only catalog sync has inserted 425 demo documents with 768-dimensional vectors. A live Gemini embedding query returned the expected Tân Triều pomelo records from vector search; the PostgreSQL full-text RPC also returned related farm/batch records. Live API smoke for `NF-DEMO-001` returned HTTP 200 with the matching rambutan passport and product card. LangSmith showed the supervisor, traceability, evidence-critic, and synthesis nodes with redacted inputs and outputs. These checks confirm the local integration against the configured providers; they do not verify the hosted Vercel deployment.
