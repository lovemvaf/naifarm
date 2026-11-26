alter table public.mentor_cases add column if not exists title text not null default '';
alter table public.mentor_cases add column if not exists feedback text;

update public.mentor_cases set title = topic where title = '';

update public.mentor_cases
set title = 'Tối ưu bao bì chống dập khi giao chôm chôm đường dài'
where id = 'MNT-01';

update public.mentor_cases
set title = 'Chuẩn hóa hồ sơ vùng trồng và nhật ký phân hữu cơ cho Bưởi Tân Triều',
    feedback = 'Đã hướng dẫn ghi đầy đủ ngày cách ly phân bón và tách bản ghi nội bộ/công khai.'
where id = 'MNT-02';

update public.mentor_cases
set title = 'Kỹ thuật nuôi ong hoa nhãn & thu hoạch mật an toàn'
where id = 'MNT-03';

update public.mentor_cases
set title = 'Tiêu chuẩn rang củi & phân loại hạt điều xuất khẩu'
where id = 'MNT-04';

update public.mentor_cases
set title = 'Bao bì chống dập & quy trình vận chuyển đường dài'
where id = 'MNT-05';