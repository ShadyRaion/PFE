import api from "../api/axios";

function ExportButton({ endpoint, filename = "export.csv", children = "Exporter" }) {
  const handleExport = async () => {
    const res = await api.get(endpoint, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = window.document.createElement("a");
    link.href = url;
    link.download = filename;
    window.document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="rounded-lg border border-[#cfe1e8] bg-white px-4 py-2 font-bold text-cyan-700 hover:bg-cyan-50"
    >
      {children}
    </button>
  );
}

export default ExportButton;
