async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/forgot-password');
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}
run();
