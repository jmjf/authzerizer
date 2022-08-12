import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: 'env/dev.env' });
console.log('env', process.env['DATABASE_URL']);

const prisma = new PrismaClient();

const resources = [
	{
		title: 'The house of the sleeping beauties',
		subtitle: 'and other stories',
		authors: [
			{
				authorName: 'Kawabata, Yasunari',
				roleTerm: 'author',
			},
			{
				authorName: 'Mishima, Yukio',
				roleTerm: 'writer of introduction',
			},
			{
				authorName: 'Seidensticker, Edward',
				roleTerm: 'translator',
			},
		],
		lcCallNumber: 'PL832.A9 H6 2017',
		ddCallNumber: '895.634',
		isbn: '9780525434139',
		abstract:
			"In the three surreal, erotically charged tales in this collection, Nobel Prize winner Yasunari Kawabata examines the boundaries between fantasy and reality in the minds of three lonely men. These stories are piercing evocations of sexuality and human psychology-- and works of remarkable subtlety and beauty--that showcase one of the twentieth century's great writers at his very best.",
		subjects: [
			'Manners and customs',
			'Social life and customs — Fiction — Japan',
		],
		publisherName:
			'Vintage International/Vintage Books, a division of Penguin Random House LLC',
		publishedDate: '2017',
		resourceId: '12d7df08-6176-4611-9cfd-9038aafd14e0',
	},
	{
		title: 'The decay of the angel',
		subtitle: '',
		authors: [
			{
				authorName: 'Mishima, Yukio',
				roleTerm: 'creator',
			},
			{
				authorName: 'Seidensticker, Edward',
				roleTerm: 'translator',
			},
		],
		lcCallNumber: 'PZ3.M6878 Se vol. 4',
		ddCallNumber: '895.6/3/5',
		isbn: '0394466136',
		abstract:
			"Yukio Mishima's The Decay of the Angel is the final novel in his masterful tetralogy, The Sea of Fertility. It is the last installment of Shigekuni Honda's pursuit of the successive reincarnations of his childhood friend Kiyoaki Matsugae. It is the late 1960s and Honda, now an aged and wealthy man, once more encounters a person he believes to be a reincarnation of his friend, Kiyoaki -- this time restored to life as a teenage orphan, Tōru. Adopting the boy as his heir, Honda quickly finds that Tōru is a force to be reckoned with. The final novel of this celebrated tetralogy weaves together the dominant themes of the previous three novels in the series: the decay of Japan's courtly tradition; the essence and value of Buddhist philosophy and aesthetics; and, underlying all, Mishima's apocalyptic vision of the modern era.",
		subjects: [
			'Japanese fiction — Translation into English — 20th century',
			'Japanese fiction — Shōwa period, 1926-1989',
		],
		publisherName: 'Knopf; [distributed by Random House]',
		publishedDate: '1974',
		resourceId: '3564f953-9a02-4fb6-95a0-d29f7e55c227',
	},
	{
		title: 'Sun & steel',
		subtitle: '',
		authors: [
			{
				authorName: 'Mishima, Yukio',
				roleTerm: '',
			},
			{
				authorName: 'Vidal, Gore',
				roleTerm: 'former owner',
			},
			{
				authorName: 'Bester, John',
				roleTerm: 'translator',
			},
		],
		lcCallNumber: 'PL 833.I7 T313',
		ddCallNumber: '895.6/3/5 B',
		isbn: '0870111175',
		abstract: 'Consists of a series of essays.',
		subjects: [],
		publisherName: 'Kodansha International Ltd.',
		publishedDate: '1970',
		resourceId: 'f6a71ed8-6085-45ff-a206-c545798b39ce',
	},
	{
		title: 'Runaway horses',
		subtitle: '',
		authors: [
			{
				authorName: 'Mishima, Yukio',
				roleTerm: 'creator',
			},
			{
				authorName: 'Gallagher, Michael',
				roleTerm: 'tr',
			},
		],
		lcCallNumber: 'PZ3.M6878 Se vol. 2',
		ddCallNumber: '895.6/3/5',
		isbn: '0394466187',
		abstract:
			"Yukio Mishima's Runaway Horses is the second novel in his masterful tetralogy, The Sea of Fertility. Again we encounter Shigekuni Honda, who narrates this epic tale of what he believes are the successive reincarnations of his childhood friend Kiyoaki Matsugae. In 1932, Shigekuni Honda has become a judge in Osaka. Convinced that a young rightist revolutionary, Isao, is the reincarnation of his friend Kiyoaki, Honda commits himself to saving the youth from an untimely death. Isao, driven to patriotic fanaticism by a father who instilled in him the ethos of the ancient samurai, organizes a violent plot against the new industrialists who he believes are usurping the Emperor's rightful power and threatening the very integrity of the nation. Runaway Horses is the chronicle of a conspiracy -- a novel about the roots and nature of Japanese fanaticism in the years that led to war.",
		subjects: ['Revolutionaries — Fiction'],
		publisherName: 'Knopf; [distributed by Random House]',
		publishedDate: '1973',
		resourceId: '3fadfc24-5518-43b9-b2d0-b713e3603fe4',
	},
	{
		title: 'The temple of dawn',
		subtitle: '',
		authors: [
			{
				authorName: 'Mishima, Yukio',
				roleTerm: 'creator',
			},
			{
				authorName: 'Saunders, E. Dale (Ernest Dale)',
				roleTerm: 'translator',
			},
			{
				authorName: 'Seigle, Cecilia Segawa',
				roleTerm: 'translator',
			},
		],
		lcCallNumber: 'PZ3.M6878 Se vol. 3',
		ddCallNumber: '895.6/3/5',
		isbn: '0394466144',
		abstract: '',
		subjects: ['Japanese — Travel — Fiction — India', 'Legal stories'],
		publisherName: 'Knopf; [distributed by Random House]',
		publishedDate: '1973',
		resourceId: 'ce781612-4bc3-4a3b-93f2-54299a5163d1',
	},
	{
		title: 'Spring snow',
		subtitle: '',
		authors: [
			{
				authorName: 'Mishima, Yukio',
				roleTerm: 'creator',
			},
			{
				authorName: 'Gallagher, Michael',
				roleTerm: 'translator',
			},
		],
		lcCallNumber: 'PZ3.M6878 Se vol. 1',
		ddCallNumber: '895.6/3/5 s 895.6/3/5',
		isbn: '0394442393',
		abstract:
			'Tokyo, 1912. The closed world of the ancient aristocracy is being breached for the first time by outsiders - rich provincial families, a new and powerful political and social elite. Kiyoaki has been raised among the elegant Ayakura family - members of the waning aristocracy - but he is not one of them. Coming of age, he is caught up in the tensions between old and new, and his feelings for the exquisite, spirited Sakoto, observed from the sidelines by his devoted friend Honda. When Sakoto is engaged to a royal prince, Kiyoaki realises the magnitude of his passion',
		subjects: [
			'Social classes — Fiction',
			'Man-woman relationships — Fiction',
			'Rich people — Fiction',
			'Japanese fiction — 20th century',
			'History — Fiction — Japan — 20th century',
		],
		publisherName: 'Knopf',
		publishedDate: '1972',
		resourceId: '913fd3e4-ec79-48df-8f5c-22d9915de663',
	},
	{
		title: 'Acts of worship',
		subtitle: 'seven stories',
		authors: [
			{
				authorName: 'Mishima, Yukio',
				roleTerm: 'creator',
			},
			{
				authorName: 'Bester, John',
				roleTerm: '',
			},
		],
		lcCallNumber: 'PL833.I7 A24 1989',
		ddCallNumber: '895.6/35',
		isbn: '0870119370 (U.S.)',
		abstract:
			"The first comprehensive collection in English of the controversial Japanese writer's short fiction includes stories from throughout his career, dealing with love and sexuality, the union of mind and body, and other themes",
		subjects: [
			'Translations, English',
			'Translations into English',
			'Social life and customs — Fiction — Japan',
		],
		publisherName: 'Kodansha International',
		publishedDate: '1989',
		resourceId: '4d5ce005-2b19-4b24-9731-59f383540626',
	},
	{
		title: 'The sound of waves',
		subtitle: '',
		authors: [
			{
				authorName: 'Mishima, Yukio',
				roleTerm: 'creator',
			},
		],
		lcCallNumber: 'PL833.I7 S413 1980',
		ddCallNumber: '',
		isbn: '0399504877',
		abstract:
			'Ugly gossip threatens a young couple in a Japanese fishing village',
		subjects: [
			'Man-woman relationships — Fiction — Japan',
			'Fishing villages — Fiction',
		],
		publisherName: 'Putnam',
		publishedDate: '[1980] c1956',
		resourceId: '472b534f-fee0-40cd-8c85-a163b3f4b172',
	},
	{
		title: 'The way of the samurai',
		subtitle: 'Yukio Mishima on Hagakure in modern life',
		authors: [
			{
				authorName: 'Mishima, Yukio',
				roleTerm: 'creator',
			},
		],
		lcCallNumber: 'BJ971.B8 Y333313',
		ddCallNumber: '',
		isbn: '0465090893',
		abstract: '',
		subjects: ['Bushido'],
		publisherName: 'Basic Books',
		publishedDate: 'c1977',
		resourceId: 'dc961620-ea27-4001-97ac-dcbc197d248b',
	},
	{
		title: 'Five modern nō plays',
		subtitle: '',
		authors: [
			{
				authorName: 'Mishima, Yukio',
				roleTerm: 'creator',
			},
		],
		lcCallNumber: 'PL833.I7 K513 1973',
		ddCallNumber: '',
		isbn: '0394718836',
		abstract: '',
		subjects: ['Translations into English'],
		publisherName: 'Vintage Books',
		publishedDate: '[1973, c1957]',
		resourceId: '68214396-1806-453b-a709-8ed8d81be261',
	},
	{
		title: 'Death in midsummer, and other stories',
		subtitle: '',
		authors: [
			{
				authorName: 'Mishima, Yukio',
				roleTerm: 'creator',
			},
			{
				authorName: 'New Directions Publishing',
				roleTerm: '',
			},
		],
		lcCallNumber: 'PZ3.M6878 De',
		ddCallNumber: '',
		isbn: '9780811201179',
		abstract:
			"Recognized throughout the world for his brilliance as a novelist and playwright, Yukio Mishima is also noted as a master of the short story in his native Japan, where the form is practiced as a major art. Nine of Yukio Mishima's finest stories were selected by Mishima himself for translation in this book; they represent his extraordinary ability to depict a wide variety of human beings in moments of significance. Often his characters are sophisticated modern Japanese who turn out to be not so liberated from the past as they had thought",
		subjects: [
			'Short stories, Japanese',
			'Social life and customs — Fiction — Japan',
		],
		publisherName: 'New Directions',
		publishedDate: '',
		resourceId: '4c4e1940-f4b9-4980-bbbd-344e9089cde0',
	},
	{
		title: 'The temple of the golden pavilion',
		subtitle: '',
		authors: [
			{
				authorName: 'Mishima, Yukio',
				roleTerm: 'creator',
			},
			{
				authorName: 'Morris, Ivan',
				roleTerm: 'translator',
			},
			{
				authorName: 'Ross, Nancy Wilson',
				roleTerm: 'writer of introduction',
			},
			{
				authorName: 'Komatsu, Fumi',
				roleTerm: 'illustrator',
			},
		],
		lcCallNumber: 'PZ3.M6878 Te',
		ddCallNumber: '895.63',
		isbn: '',
		abstract:
			'The son of a poor rural priest becomes an acolyte at the Temple of the Golden Pavilion. Mizoguchi had built up an image of ideal beauty in his mind based on this Golden Pavilion; this ideal image causes him to feel disappointed in any supposed form of beauty, even the actual physical Golden Pavilion. He comes under the influence of Kashiwagi, a fellow student with a very bitter view of life',
		subjects: [
			'Young men — Psychology — Fiction —',
			'Buddhist temples — Fiction —',
			'Arson — Fiction —',
			'Young men — Fiction',
			'Buddhist temples — Fiction',
			'Arson — Fiction',
			'Psychological fiction',
		],
		publisherName: 'Knopf',
		publishedDate: '1959',
		resourceId: '524a61fd-ca5d-4aa6-8eab-f4bf25d6c26c',
	},
];

async function main() {
	for (const resource of resources) {
		const { resourceId, authors, subjects, ...restOfResource } = resource;
		const mappedAuthors = authors.map((author) => {
			return {
				Author: { create: { authorName: author.authorName } },
				roleName: author.roleTerm,
			};
		});
		const mappedSubjects = subjects.map((subject) => {
			return { subjectText: subject };
		});
		const createdResource = await prisma.libraryResource.create({
			data: {
				...restOfResource,
				LibraryResourceToAuthor: { create: mappedAuthors },

				subjects: { create: mappedSubjects },
			},
			include: {
				LibraryResourceToAuthor: {
					include: {
						Author: true,
					},
				},
				subjects: true,
			},
		});
		console.log('created', createdResource.resourceId, createdResource.isbn);
	}
}

main();
