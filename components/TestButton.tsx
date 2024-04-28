import React from "react";

const TestButton = () => {
  const handleUpdateClick = async () => {
    try {
      const response = await fetch("/api/dailyUpdate", {
        method: "POST",
        headers: {
          Authorization: `Bearer simonja123`, // Replace with your actual secret if needed
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Response:", data);
      alert(`Server response: ${data.message}`);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to update players. Check console for more details.");
    }
  };

  return (
    <button
      onClick={handleUpdateClick}
      style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
    >
      Run Update Players
    </button>
  );
};

export default TestButton;
