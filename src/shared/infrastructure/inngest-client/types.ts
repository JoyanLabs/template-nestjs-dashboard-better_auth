// Tipos de eventos soportados por Inngest
// Define aquí todos los eventos que tu aplicación puede manejar

export type Events = {
	// Evento de ejemplo: Hello World
	'app/hello.world': {
		data: {
			message: string;
		};
	};

	// Evento: Usuario creado
	'user/created': {
		data: {
			userId: string;
			email: string;
			name: string;
		};
	};

	// Evento: Email de bienvenida
	'user/welcome.email': {
		data: {
			userId: string;
			email: string;
			name: string;
		};
	};

	// Evento: Archivo subido al storage
	'storage/file.uploaded': {
		data: {
			fileId: string;
			key: string;
			filename: string;
			contentType: string;
			size: number;
			uploadedById?: string;
		};
	};

	// Agrega más eventos según tus necesidades
	// 'tu-contexto/tu-evento': {
	//   data: { ... };
	// };
};
