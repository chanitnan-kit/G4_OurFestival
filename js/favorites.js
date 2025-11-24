(function () {
  const STORAGE_KEY = "favoriteItems";

  // โหลดรายการ favorites จาก localStorage
  const load = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  };

  // บันทึกรายการ favorites ลง localStorage
  const save = (items) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (_) {
      /* ignore */
    }
  };

  // สร้าง unique ID จาก title และ img
  const normalizeId = (title, img) => `${title}::${img}`;

  // เพิ่ม/ลบ item จาก favorites
  const toggleFavorite = (item) => {
    const items = load();
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      items.splice(idx, 1);
    } else {
      items.push(item);
    }
    save(items);
    return idx === -1; // return true ถ้าเพิ่มเข้าไป, false ถ้าลบออก
  };

  // ตรวจสอบว่า item อยู่ใน favorites หรือไม่
  const isFavorite = (id) => {
    return load().some((i) => i.id === id);
  };

  // ซิงค์ปุ่มหัวใจกับการ์ดทั้งหมด
  const syncCards = (root = document) => {
    const cards = root.querySelectorAll(".product-card");
    cards.forEach((card) => {
      const title = (card.querySelector(".title")?.textContent || "").trim();
      const price = (card.querySelector(".price")?.textContent || "").trim();
      const img =
        card.querySelector(".product-img img, .product-img-eve img")?.getAttribute("src") || "";
      const id = normalizeId(title, img);

      // สร้างปุ่มหัวใจถ้ายังไม่มี
      let wish = card.querySelector(".wish-btn");
      if (!wish) {
        wish = document.createElement("button");
        wish.type = "button";
        wish.className = "wish-btn";
        wish.textContent = "♥";
        card.appendChild(wish);
      }
      wish.dataset.favId = id;

      // ตั้งค่าสถานะ active ตาม favorites
      const isActive = isFavorite(id);
      wish.classList.toggle("active", isActive);

      // ลบ event listener เก่าออกก่อน (ป้องกันการซ้ำซ้อน)
      const newWish = wish.cloneNode(true);
      wish.parentNode.replaceChild(newWish, wish);
      wish = newWish;

      // เพิ่ม event listener ใหม่
      wish.addEventListener("click", () => {
        const nowActive = toggleFavorite({ id, title, price, img });
        wish.classList.toggle("active", nowActive);
      });
    });
  };

  // แก้ไข path ของรูปภาพให้ทำงานได้จากทุกหน้า
  const fixPath = (p = "") => {
    // ถ้าอยู่ใน subfolder (booths/) ให้ลบ ../ ออก
    // ถ้าอยู่ที่ root ให้เก็บไว้
    if (p.startsWith("../")) {
      return p.substring(3); // ลบ ../ ออก
    }
    return p;
  };

  // แสดงรายการ favorites ในหน้า myfavoriteitem.html
  const renderFavorites = (container) => {
    if (!container) return;
    const items = load();
    container.innerHTML = "";

    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "col-12";
      empty.innerHTML = `
        <div class="favorites-empty">
          <div class="favorites-empty-icon">♥</div>
          <h2 class="favorites-empty-title">ยังไม่มีสินค้าที่ชื่นชอบ</h2>
          <p class="favorites-empty-text">กดหัวใจที่สินค้าเพื่อเพิ่มเข้ารายการโปรด<br>และกลับมาดูที่นี่ได้ทุกเมื่อ!</p>
          <a href="directory.html" class="favorites-empty-btn">เริ่มช้อปปิ้ง</a>
        </div>
      `;
      container.appendChild(empty);
      return;
    }

    items.forEach((item) => {
      const col = document.createElement("div");
      col.className = "col";

      const card = document.createElement("div");
      card.className = "card product-card h-100 position-relative";

      const imgSrc = fixPath(item.img) || "resources/Banner.png";

      card.innerHTML = `
        <div class="product-img">
          <img src="${imgSrc}" alt="${item.title}">
        </div>
        <div class="card-body">
          <div class="title">${item.title}</div>
          <div class="cart-footer-line mt-2">
            <span class="price">${item.price}</span>
            <button type="button" class="cart-add-btn" data-cart-add="true">Add to cart</button>
          </div>
        </div>
      `;

      // เพิ่มปุ่มหัวใจ
      const wish = document.createElement("button");
      wish.type = "button";
      wish.className = "wish-btn active"; // active เพราะอยู่ใน favorites แล้ว
      wish.textContent = "♥";
      wish.dataset.favId = item.id;
      card.appendChild(wish);

      // เมื่อกดหัวใจจะลบออกจาก favorites
      wish.addEventListener("click", () => {
        toggleFavorite(item);
        renderFavorites(container); // render ใหม่
      });

      col.appendChild(card);
      container.appendChild(col);
    });
  };

  // Export functions ให้ใช้งานได้จากภายนอก
  window.favoriteStore = {
    load,
    save,
    syncCards,
    renderFavorites,
    toggleFavorite,
    isFavorite,
  };

  // Auto-sync เมื่อโหลดหน้าเว็บ
  document.addEventListener("DOMContentLoaded", () => {
    syncCards();
  });
})();
