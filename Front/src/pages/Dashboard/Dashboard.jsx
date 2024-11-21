import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import Card from "../../components/Card/Card";
import { uploadFile, getUserFiles, deleteFile } from "../../service/apiService";
import Input from "../../components/Input/Input";
import { toast } from "react-toastify";

const Dashboard = () => {
    const [storage, setStorage] = useState(null);
    const [selectedStorage, setSelectedStorage] = useState(null);
    const [progress, setProgress] = useState(0);
    const [progressColor, setProgressColor] = useState("");
    const [files, setFiles] = useState([]);
    const [successfulFiles, setSuccessfulFiles] = useState([]);
    const [failedFiles, setFailedFiles] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = "votre_token_ici";
        getUserFiles(token)
            .then((res) => {
                setStorage(res.files);
                console.log(res);
            })
            .catch((err) => {
                console.error("Erreur lors de la récupération des fichiers :", err);
                toast.error("Erreur lors de la récupération des fichiers.");
            });
    }, []);

    useEffect(() => {
        if (progress < 50) {
            setProgressColor("bg-red-500");
        } else if (progress < 75) {
            setProgressColor("bg-yellow-500");
        } else {
            setProgressColor("bg-green-500");
        }
    }, [progress]);

    const onDrop = useCallback((acceptedFiles) => {
        setProgress(0);
        setProgressColor("");
        setSuccessfulFiles([]);
        setFailedFiles([]);
        setError(null);

        if (!selectedStorage) {
            toast.error("Veuillez sélectionner un espace de stockage.");
            return;
        }

        const formData = new FormData();
        acceptedFiles.forEach((file) => {
            formData.append("file", file);
        });
        formData.append("userStorageId", selectedStorage.toString());

        const token = "votre_token_ici";

        uploadFile(formData, token)
            .then((res) => {
                setError(null);
                setSuccessfulFiles(res.savedFiles || []);
                setFailedFiles(res.unsavedFiles || []);
                toast.success("Fichiers téléchargés avec succès !");
            })
            .catch((err) => {
                console.error("Erreur lors de l'upload des fichiers :", err);
                setProgressColor("bg-red-500");
                setError("Erreur lors de l'upload des fichiers.");
                toast.error("Erreur lors de l'upload des fichiers.");
            });
    }, [selectedStorage]);

    const handleDeleteFile = (fileId) => {
        const token = "votre_token_ici";

        deleteFile(fileId, token)
            .then(() => {
                setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
                toast.success("Fichier supprimé avec succès !");
            })
            .catch((err) => {
                console.error("Erreur lors de la suppression du fichier :", err);
                toast.error("Erreur lors de la suppression du fichier.");
            });
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    return (
        <Fragment>
            {storage && (
                <div className="m-5">
                    <h1 className="text-2xl font-bold mb-3">Télécharger vos fichiers</h1>
                    <Card css="mt-10">
                        <div className="flex flex-col justify-center w-full gap-5">
                            <Input
                                type="select"
                                label="Sélectionner votre espace de stockage"
                                onChange={(e) => setSelectedStorage(e.target.value)}
                            >
                                <option value="">Sélectionner votre espace de stockage</option>
                                {storage.map((item, index) => (
                                    <option key={index} value={item.id}>
                                        {item.name} - {item.size} Go
                                    </option>
                                ))}
                            </Input>

                            <div {...getRootProps()} className="flex justify-center items-center border-dashed">
                                <input {...getInputProps()} />
                                <p>Glissez vos fichiers ici ou cliquez pour sélectionner.</p>
                            </div>

                            {files.map((file) => (
                                <div key={file.id} className="flex justify-between">
                                    {file.name}
                                    <button onClick={() => handleDeleteFile(file.id)}>Supprimer</button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}
        </Fragment>
    );
};

export default Dashboard;
