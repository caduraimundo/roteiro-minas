import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatarData, formatarPreco } from "@/lib/format";

export type DadosTicket = {
  roteiroNome: string;
  compradorNome: string;
  data: string;
  valorPago: number;
  codigoVerificacao: string;
};

/**
 * Gera o PDF do ticket sob demanda (não é persistido em Storage - decisão
 * documentada no Notion, a regeneração é determinística a partir dos dados
 * já salvos em `vendas`/`vagas`/`roteiros`).
 *
 * Usa as fontes padrão do pdf-lib (WinAnsiEncoding cobre acentuação do
 * português normalmente) - sem @pdf-lib/fontkit aqui, já que o layout é
 * simples e não precisa de fonte customizada embutida.
 */
export async function gerarTicketPdf(dados: DadosTicket): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width } = page.getSize();

  const fonteRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fonteBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const preto = rgb(0.1, 0.1, 0.1);
  const cinza = rgb(0.4, 0.4, 0.4);

  let y = 780;

  const desenharCentralizado = (
    texto: string,
    tamanho: number,
    fonte: typeof fonteRegular,
    cor = preto,
  ) => {
    const larguraTexto = fonte.widthOfTextAtSize(texto, tamanho);
    page.drawText(texto, {
      x: (width - larguraTexto) / 2,
      y,
      size: tamanho,
      font: fonte,
      color: cor,
    });
  };

  desenharCentralizado("Roteiro Minas", 14, fonteRegular, cinza);
  y -= 40;

  desenharCentralizado(dados.roteiroNome, 26, fonteBold);
  y -= 60;

  page.drawLine({
    start: { x: 60, y },
    end: { x: width - 60, y },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });
  y -= 40;

  const linha = (rotulo: string, valor: string) => {
    page.drawText(rotulo, { x: 60, y, size: 11, font: fonteRegular, color: cinza });
    page.drawText(valor, { x: 220, y, size: 13, font: fonteBold, color: preto });
    y -= 30;
  };

  linha("Comprador", dados.compradorNome);
  linha("Data do passeio", formatarData(dados.data));
  linha("Valor pago", formatarPreco(dados.valorPago));

  y -= 50;

  desenharCentralizado("Código de verificação", 12, fonteRegular, cinza);
  y -= 50;

  desenharCentralizado(dados.codigoVerificacao, 40, fonteBold);
  y -= 60;

  desenharCentralizado(
    "Apresente este código ao guia no dia do passeio.",
    10,
    fonteRegular,
    cinza,
  );

  return pdfDoc.save();
}
