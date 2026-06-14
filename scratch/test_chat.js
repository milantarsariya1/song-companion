async function test() {
  const payload = {
    lyrics: "On a dark desert highway, cool wind in my hair...",
    trackName: "Hotel California",
    artistName: "Eagles",
    albumName: "Hotel California",
    messages: [],
    mode: "translate",
    targetLanguage: "Spanish"
  };

  try {
    const res = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    console.log("Response Status:", res.status);
    const text = await res.text();
    console.log("Response Text:", text);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

test();
