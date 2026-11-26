/* Muffin & Coffee — datos compartidos por los 4 diseños */
const MC = {
  nombre: "Muffin & Coffee",
  wa: "573117211954",
  waTxt: "+57 311 721 1954",
  dir: "Calle 16 # 4-35, local — Pasaje peatonal Mario Echeverry (Cra. 5 con Cl. 16)",
  ciudad: "Quimbaya, Quindío",
  horario: "Lunes a domingo · 9:00 a.m. – 10:00 p.m.",
  rating: "4.9",
  opiniones: "171",
  instagram: "https://www.instagram.com/muffincoffee_co/",
  resena: "https://search.google.com/local/writereview?placeid=ChIJT9kEMOphOI4Rron2UmWhgnc",
  resenas: "https://search.google.com/local/reviews?placeid=ChIJT9kEMOphOI4Rron2UmWhgnc",
  maps: "https://www.google.com/maps/search/?api=1&query=Muffin+%26+Coffee+Quimbaya",
  mapEmbed: "https://maps.google.com/maps?q=Muffin%20%26%20Coffee%20Quimbaya%20Quind%C3%ADo&t=m&z=17&output=embed",
};

const MENU = [
  {
    id: "nata", titulo: "Pastel de Nata", sub: "La receta original de Olnardy · 14 años perfeccionándola",
    img: "nata-plato",
    items: [
      { n: "Pastel de Nata", d: "Hojaldre crujiente horneado al momento y crema suave y dorada. Con canela y azúcar al gusto.", tag: "El más pedido", img: "nata-dorado" },
      { n: "Caja de Pasteles de Nata", d: "Para llevar, compartir o regalar. Pídela con anticipación por WhatsApp.", tag: "Para regalar", img: "olnardy-clientes" },
      { n: "Pastel de Nata + Café", d: "La pareja perfecta: un pastel recién salido del horno con café de especialidad del Quindío.", img: "nata-cafe" },
    ],
  },
  {
    id: "panaderia", titulo: "Panadería y Repostería", sub: "Artesanal y exclusiva, hecha aquí todos los días",
    img: "pan-artesanal",
    items: [
      { n: "Muffins Artesanales", d: "Esponjosos y caseros. El de zanahoria es el favorito de los visitantes.", tag: "Favorito", img: "pan-artesanal" },
      { n: "Pan de Queso", d: "Recién horneado, crocante por fuera y suave por dentro." },
      { n: "Cookies", d: "Galletas artesanales para acompañar el café." },
      { n: "Ciabattas", d: "Pan de corteza crujiente y miga aireada.", img: "sandwiches-vitrina" },
      { n: "Pan Artesanal", d: "Masa madre y fermentación lenta, como se hace en casa." },
    ],
  },
  {
    id: "cafe", titulo: "Café y Bebidas", sub: "Café de especialidad del Quindío",
    img: "cafe-taza",
    items: [
      { n: "Café de Especialidad", d: "Granos seleccionados de nuestra región cafetera, preparados con cariño.", tag: "De la región", img: "cafe-taza" },
      { n: "Espresso", d: "Intenso, aromático y con crema perfecta.", img: "cafe-mesa" },
      { n: "Americano", d: "Suave y largo, ideal para conversar." },
      { n: "Capuchino", d: "Espresso con leche cremosa y espuma, con un toque de canela.", img: "cafe-sandwich" },
      { n: "Latte", d: "Más leche, más suave, el compañero ideal del pastel de nata.", img: "mesa-6" },
      { n: "Jugos Naturales", d: "Frutas frescas del Quindío.", img: "mesa-pizza" },
    ],
  },
  {
    id: "sanduches", titulo: "Sándwiches", sub: "En ciabatta y pan artesanal de la casa",
    img: "sandwiches-vitrina",
    items: [
      { n: "Sándwich en Ciabatta", d: "Jamón, queso y lechuga fresca en ciabatta crocante de la casa.", img: "sandwich" },
      { n: "Sándwich en Pan Artesanal", d: "Preparado al momento, perfecto con un capuchino.", img: "sandwiches-vitrina" },
    ],
  },
  {
    id: "pizzas", titulo: "Pizzas Artesanales", sub: "Masa delgada, horno caliente y mucho queso",
    img: "pizza-gourmet",
    items: [
      { n: "Hawaiana", d: "Jamón, piña y queso mozzarella.", img: "pizza-hawaiana" },
      { n: "Pollo y Champiñón", d: "Pollo desmechado, champiñones y queso." },
      { n: "Vegetales", d: "Pimentón, cebolla, tomate, champiñón y aceitunas." },
      { n: "Ranchera", d: "Salchicha ranchera, maíz tierno y queso." },
      { n: "Peperoni", d: "Clásica, con abundante peperoni y mozzarella.", tag: "Clásica", img: "pizza-peperoni" },
      { n: "Carnes", d: "Para los de buen apetito: variedad de carnes y queso." },
      { n: "Napolitana", d: "Tomate, albahaca fresca y mozzarella.", img: "pizza-gourmet" },
    ],
  },
  {
    id: "almuerzo", titulo: "Almuerzo Ejecutivo Gourmet", sub: "Con Arte-sano Trattoria · Arma tu almuerzo",
    img: "mesa-pizza",
    items: [
      { n: "Crema del día", d: "Pollo, brócoli o pescado." },
      { n: "Principio", d: "Fríjol, lentejas o garbanzos." },
      { n: "Acompañantes", d: "Arroz, ensalada fresca, yuca hogao, papa en casco o plátano tentación." },
      { n: "Proteína", d: "Chuleta de res, cerdo, pollo o costilla BBQ en salsa de guayaba.", tag: "Gourmet" },
    ],
  },
];

const GALERIA = [
  "nata-bandeja", "fachada", "olnardy-horneando", "nata-cafe", "pizza-gourmet", "terraza-girasoles",
  "nata-closeup", "cafe-sandwich", "vitrina", "nata-cremoso", "local-clientes", "pizza-peperoni",
  "desayuno", "nata-tanda", "terraza", "sandwich",
  "barra-interior", "aviso-local",
];
