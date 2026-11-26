const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const courtSelect = document.getElementById('courtSelect');
const priceEstimate = document.getElementById('priceEstimate');
const bookingForm = document.getElementById('bookingForm');
const successMessage = document.getElementById('successMessage');
const bookingDate = document.getElementById('bookingDate');
const formHeading = document.querySelector('.form-heading');

// Harga setiap lapangan
const prices = {
  'Futsal A': 100000,
  'Futsal B': 120000,
  'Badminton': 50000
};

// Format Rupiah
const rupiah = (number) => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
}).format(number);

// Mencegah input pelanggan dibaca sebagai HTML
const escapeHTML = (value) => {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[char]);
};

// Menu navigasi
menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');

  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.textContent = isOpen ? '✕' : '☰';
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = '☰';
  });
});

// Tanggal minimal hari ini
const today = new Date();
const localToday = new Date(
  today.getTime() - today.getTimezoneOffset() * 60000
).toISOString().split('T')[0];

bookingDate.min = localToday;

// Update estimasi harga
function updatePrice() {
  const price = prices[courtSelect.value] || 0;
  priceEstimate.textContent = rupiah(price);
}

courtSelect.addEventListener('change', updatePrice);

// Tombol pesan pada kartu lapangan
document.querySelectorAll('.book-button').forEach(button => {
  button.addEventListener('click', () => {
    courtSelect.value = button.dataset.court;
    updatePrice();

    document.getElementById('pemesanan')
      .scrollIntoView({ behavior: 'smooth' });
  });
});

// Tempat menampilkan struk
const receiptContainer = document.createElement('div');
receiptContainer.id = 'receiptContainer';
receiptContainer.className = 'receipt-container';
receiptContainer.hidden = true;

bookingForm.after(receiptContainer);

// Proses pemesanan
bookingForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!bookingForm.reportValidity()) return;

  const formData = new FormData(bookingForm);

  const name = formData.get('customerName').trim();
  const phone = formData.get('phone').trim();
  const date = formData.get('bookingDate');
  const court = formData.get('court');
  const time = formData.get('time');

  // Validasi nomor WhatsApp
  if (!/^[0-9+\s-]{9,16}$/.test(phone)) {
    successMessage.className = 'success-message show';
    successMessage.textContent =
      'Nomor WhatsApp belum sesuai. Periksa kembali nomor kamu.';
    return;
  }

  const price = prices[court];

  // Kode booking unik untuk simulasi
  const bookingCode = 'SZ-' +
    Date.now().toString().slice(-8);

  // Format tanggal Indonesia
  const formattedDate = new Date(date + 'T00:00:00')
    .toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

  // Buat struk
  receiptContainer.innerHTML = `
    <div class="receipt-card">

      <div class="receipt-header">
        <div class="receipt-logo">⚽ SPORT<span>ZONE</span></div>
        <p>BUKTI PEMESANAN LAPANGAN</p>
        <div class="receipt-status">
          ✓ BOOKING BERHASIL DICATAT
        </div>
      </div>

      <div class="receipt-divider"></div>

      <div class="receipt-row">
        <span>Kode Booking</span>
        <strong>${bookingCode}</strong>
      </div>

      <div class="receipt-row">
        <span>Tanggal Pemesanan</span>
        <strong>${new Date().toLocaleDateString('id-ID')}</strong>
      </div>

      <div class="receipt-divider"></div>

      <h4>DATA PELANGGAN</h4>

      <div class="receipt-row">
        <span>Nama</span>
        <strong>${escapeHTML(name)}</strong>
      </div>

      <div class="receipt-row">
        <span>WhatsApp</span>
        <strong>${escapeHTML(phone)}</strong>
      </div>

      <div class="receipt-divider"></div>

      <h4>DETAIL PEMESANAN</h4>

      <div class="receipt-row">
        <span>Lapangan</span>
        <strong>${escapeHTML(court)}</strong>
      </div>

      <div class="receipt-row">
        <span>Tanggal Bermain</span>
        <strong>${formattedDate}</strong>
      </div>

      <div class="receipt-row">
        <span>Jam Bermain</span>
        <strong>${escapeHTML(time)}</strong>
      </div>

      <div class="receipt-row">
        <span>Durasi</span>
        <strong>1 Jam</strong>
      </div>

      <div class="receipt-divider"></div>

      <div class="receipt-total">
        <span>TOTAL PEMESANAN</span>
        <strong>${rupiah(price)}</strong>
      </div>

      <div class="receipt-payment">
        Status pembayaran: Belum dibayar
      </div>

      <p class="receipt-note">
        *Ini merupakan bukti pemesanan simulasi.
        Pemesanan belum menjadi reservasi terkonfirmasi.
      </p>

      <div class="receipt-actions">
        <button type="button" id="printReceipt">
          🖨 Cetak Struk
        </button>

        <button type="button" id="newBooking">
          + Pesan Lagi
        </button>
      </div>

      <p class="receipt-thanks">
        Terima kasih telah memilih SportZone!
      </p>

    </div>
  `;

  // Sembunyikan form dan tampilkan struk
  bookingForm.hidden = true;
  formHeading.hidden = true;
  successMessage.className = 'success-message';

  receiptContainer.hidden = false;

  receiptContainer.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });

  // Tombol cetak
  document.getElementById('printReceipt')
    .addEventListener('click', () => {
      document.body.classList.add('printing-receipt');

      window.print();
    });

  // Bersihkan mode cetak setelah selesai
  window.addEventListener('afterprint', () => {
    document.body.classList.remove('printing-receipt');
  }, { once: true });

  // Tombol pemesanan baru
  document.getElementById('newBooking')
    .addEventListener('click', () => {
      receiptContainer.hidden = true;
      bookingForm.hidden = false;
      formHeading.hidden = false;

      bookingForm.reset();
      priceEstimate.textContent = rupiah(0);
      bookingDate.min = localToday;

      document.getElementById('pemesanan')
        .scrollIntoView({ behavior: 'smooth' });
    });
});
