"use client";

import { useMutation, useOthers, useSelf, useStorage } from "@liveblocks/react";
import Link from "next/link";
import { AiOutlineFontSize } from "react-icons/ai";
import { IoEllipseOutline, IoSquareOutline } from "react-icons/io5";
import { PiPathLight, PiSidebarSimpleThin } from "react-icons/pi";
import { Color, LayerType } from "~/types";
import { colorToCss, connectionIdToColor, hexToRgb } from "~/utils";
import LayerButton from "./LayerButton";
import NumberInput from "./NumberInput";
import { BsCircleHalf } from "react-icons/bs";
import { RiRoundedCorner } from "react-icons/ri";
import ColorPicker from "./ColorPicker";
import Dropdown from "./Dropdown";
import UserAvatar from "./UserAvatar";
import { User } from "@prisma/client";
import ShareMenu from "./ShareMenu";

export default function Sidebars({
  roomName,
  roomId,
  othersWithAccessToRoom,
  leftIsMinimized,
  setLeftIsMinimized,
}: {
  roomName: string;
  roomId: string;
  othersWithAccessToRoom: User[];
  leftIsMinimized: boolean;
  setLeftIsMinimized: (value: boolean) => void;
}) {
  const me = useSelf();
  const others = useOthers();

  const selectedLayer = useSelf((me) => {
    const selection = me.presence.selection;
    return selection.length === 1 ? selection[0] : null;
  });

  const layer = useStorage((root) => {
    if (!selectedLayer) {
      return null;
    }
    return root.layers.get(selectedLayer);
  });

  const roomColor = useStorage((root) => root.roomColor);

  const layers = useStorage((root) => root.layers);
  const layerIds = useStorage((root) => root.layerIds);
  const reversedLayerIds = [...(layerIds ?? [])].reverse();

  const selection = useSelf((me) => me.presence.selection);

  const setRoomColor = useMutation(({ storage }, newColor: Color) => {
    storage.set("roomColor", newColor);
  }, []);

  const updateLayer = useMutation(
    (
      { storage },
      updates: {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        opacity?: number;
        cornerRadius?: number;
        fill?: string;
        stroke?: string;
        fontSize?: number;
        fontWeight?: number;
        fontFamily?: string;
      },
    ) => {
      if (!selectedLayer) return;

      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(selectedLayer);

      if (layer) {
        layer.update({
          ...(updates.x !== undefined && { x: updates.x }),
          ...(updates.y !== undefined && { y: updates.y }),
          ...(updates.width !== undefined && { width: updates.width }),
          ...(updates.height !== undefined && { height: updates.height }),
          ...(updates.opacity !== undefined && { opacity: updates.opacity }),
          ...(updates.cornerRadius !== undefined && {
            cornerRadius: updates.cornerRadius,
          }),
          ...(updates.fill !== undefined && { fill: hexToRgb(updates.fill) }),
          ...(updates.stroke !== undefined && {
            stroke: hexToRgb(updates.stroke),
          }),
          ...(updates.fontSize !== undefined && { fontSize: updates.fontSize }),
          ...(updates.fontWeight !== undefined && {
            fontWeight: updates.fontWeight,
          }),
          ...(updates.fontFamily !== undefined && {
            fontFamily: updates.fontFamily,
          }),
        });
      }
    },
    [selectedLayer],
  );

  return (
    <>
{/* Sidebar Izquierdo Expandido */}
{!leftIsMinimized ? (
  <div className="fixed left-0 flex h-screen w-[240px] flex-col border-r border-gray-200 bg-white">
    {/* Encabezado */}
    <div className="p-4">
      <div className="flex justify-between items-center">
        <Link href="/dashboard">
          <img
            src="/figma-logo.svg"
            alt="Figma logo"
            className="h-5 w-5"
          />
        </Link>
        <PiSidebarSimpleThin
          onClick={() => setLeftIsMinimized(true)}
          className="h-5 w-5 cursor-pointer text-gray-600 hover:text-gray-800"
        />
      </div>
      <h2 className="mt-3 text-base font-semibold text-gray-800">{roomName}</h2>
    </div>

    <div className="border-b border-gray-200" />

    {/* Lista de capas */}
    <div className="flex flex-col gap-2 p-4">
      <span className="mb-1 text-sm font-medium text-gray-600">Capas</span>
      {layerIds &&
        reversedLayerIds.map((id) => {
          const layer = layers?.get(id);
          const isSelected = selection?.includes(id);

          if (layer?.type === LayerType.Rectangle) {
            return (
              <LayerButton
                key={id}
                layerId={id}
                text="Rectángulo"
                isSelected={isSelected ?? false}
                icon={<IoSquareOutline className="h-4 w-4 text-gray-500" />}
              />
            );
          } else if (layer?.type === LayerType.Ellipse) {
            return (
              <LayerButton
                key={id}
                layerId={id}
                text="Elipse"
                isSelected={isSelected ?? false}
                icon={<IoEllipseOutline className="h-4 w-4 text-gray-500" />}
              />
            );
          } else if (layer?.type === LayerType.Path) {
            return (
              <LayerButton
                key={id}
                layerId={id}
                text="Dibujo"
                isSelected={isSelected ?? false}
                icon={<PiPathLight className="h-4 w-4 text-gray-500" />}
              />
            );
          } else if (layer?.type === LayerType.Text) {
            return (
              <LayerButton
                key={id}
                layerId={id}
                text="Texto"
                isSelected={isSelected ?? false}
                icon={<AiOutlineFontSize className="h-4 w-4 text-gray-500" />}
              />
            );
          }
        })}
    </div>
  </div>
) : (
  // Sidebar minimizado
  <div className="fixed left-3 top-3 flex h-[48px] w-[250px] items-center justify-between rounded-xl border bg-white p-4 shadow-sm">
    <Link href="/dashboard">
      <img
        src="/figma-logo.svg"
        alt="Figma logo"
        className="h-5 w-5"
      />
    </Link>
    <h2 className="text-sm font-medium text-gray-800 truncate max-w-[180px]">{roomName}</h2>
    <PiSidebarSimpleThin
      onClick={() => setLeftIsMinimized(false)}
      className="h-5 w-5 cursor-pointer text-gray-600 hover:text-gray-800"
    />
  </div>
)}


      {/* Right Sidebar */}
{/* Sidebar derecho */}
{!leftIsMinimized || layer ? (
  <div
    className={`fixed ${leftIsMinimized && layer ? "bottom-3 right-3 top-3 rounded-xl" : ""} ${!leftIsMinimized && !layer ? "h-screen" : ""} ${!leftIsMinimized && layer ? "bottom-0 top-0 h-screen" : ""} right-0 flex w-[260px] flex-col border-l border-gray-200 bg-white`}
  >
    {/* Avatares y Compartir */}
    <div className="flex items-center justify-between pr-2">
      <div className="max-36 flex w-full gap-2 overflow-x-scroll p-3 text-sm">
        {me && (
          <UserAvatar
            color={connectionIdToColor(me.connectionId)}
            name={me.info.name}
          />
        )}
        {others.map((other) => (
          <UserAvatar
            key={other.connectionId}
            color={connectionIdToColor(other.connectionId)}
            name={other.info.name}
          />
        ))}
      </div>
      <ShareMenu
        roomId={roomId}
        othersWithAccessToRoom={othersWithAccessToRoom}
      />
    </div>
    <div className="border-b border-gray-200" />

    {/* CONTENIDO SEGÚN SELECCIÓN */}
    {layer ? (
      <>
        {/* Posición */}
        <Section title="Posición">
          <Label text="Coordenadas" />
          <div className="flex gap-2">
            <NumberInput
              value={layer.x}
              onChange={(n) => updateLayer({ x: n })}
              classNames="w-1/2"
              icon={<p>X</p>}
            />
            <NumberInput
              value={layer.y}
              onChange={(n) => updateLayer({ y: n })}
              classNames="w-1/2"
              icon={<p>Y</p>}
            />
          </div>
        </Section>

        {/* Dimensiones */}
        {layer.type !== LayerType.Path && (
          <>
            <Divider />
            <Section title="Tamaño">
              <Label text="Dimensiones" />
              <div className="flex gap-2">
                <NumberInput
                  value={layer.width}
                  onChange={(n) => updateLayer({ width: n })}
                  classNames="w-1/2"
                  icon={<p>W</p>}
                />
                <NumberInput
                  value={layer.height}
                  onChange={(n) => updateLayer({ height: n })}
                  classNames="w-1/2"
                  icon={<p>H</p>}
                />
              </div>
            </Section>
          </>
        )}

        {/* Apariencia */}
        <Divider />
        <Section title="Apariencia">
          <div className="flex gap-2">
            <div className="w-1/2">
              <Label text="Opacidad" />
              <NumberInput
                value={layer.opacity}
                min={0}
                max={100}
                onChange={(n) => updateLayer({ opacity: n })}
                classNames="w-full"
                icon={<BsCircleHalf />}
              />
            </div>
            {layer.type === LayerType.Rectangle && (
              <div className="w-1/2">
                <Label text="Radio de borde" />
                <NumberInput
                  value={layer.cornerRadius ?? 0}
                  min={0}
                  max={100}
                  onChange={(n) => updateLayer({ cornerRadius: n })}
                  classNames="w-full"
                  icon={<RiRoundedCorner />}
                />
              </div>
            )}
          </div>
        </Section>

        {/* Color de relleno */}
        <Divider />
        <Section title="Relleno">
          <ColorPicker
            value={colorToCss(layer.fill)}
            onChange={(color) =>
              updateLayer({ fill: color, stroke: color })
            }
          />
        </Section>

        {/* Color de borde */}
        <Divider />
        <Section title="Borde">
          <ColorPicker
            value={colorToCss(layer.stroke)}
            onChange={(color) => updateLayer({ stroke: color })}
          />
        </Section>

        {/* Tipografía */}
        {layer.type === LayerType.Text && (
          <>
            <Divider />
            <Section title="Tipografía">
              <Dropdown
                value={layer.fontFamily}
                onChange={(v) => updateLayer({ fontFamily: v })}
                options={["Inter", "Arial", "Times New Roman"]}
              />
              <div className="flex gap-2">
                <div className="w-1/2">
                  <Label text="Tamaño" />
                  <NumberInput
                    value={layer.fontSize}
                    onChange={(n) => updateLayer({ fontSize: n })}
                    classNames="w-full"
                    icon={<p>A</p>}
                  />
                </div>
                <div className="w-1/2">
                  <Label text="Peso" />
                  <Dropdown
                    value={layer.fontWeight.toString()}
                    onChange={(v) =>
                      updateLayer({ fontWeight: Number(v) })
                    }
                    options={["100", "200", "300", "400", "500", "600", "700", "800", "900"]}
                  />
                </div>
              </div>
            </Section>
          </>
        )}
      </>
    ) : (
      // Sin capa seleccionada (ajustes generales)
      <Section title="Página">
        <ColorPicker
          onChange={(color) => {
            const rgbColor = hexToRgb(color);
            setRoomColor(rgbColor);
          }}
          value={roomColor ? colorToCss(roomColor) : "#1e1e1e"}
        />
      </Section>
    )}
  </div>
) : (
  // Sidebar minimizado
  <div className="fixed right-3 top-3 flex h-[48px] w-[250px] items-center justify-between rounded-xl border bg-white pr-2">
    <div className="max-36 flex w-full gap-2 overflow-x-scroll p-3 text-xs">
      {me && (
        <UserAvatar
          color={connectionIdToColor(me.connectionId)}
          name={me.info.name}
        />
      )}
      {others.map((other) => (
        <UserAvatar
          key={other.connectionId}
          color={connectionIdToColor(other.connectionId)}
          name={other.info.name}
        />
      ))}
    </div>
    <ShareMenu
      roomId={roomId}
      othersWithAccessToRoom={othersWithAccessToRoom}
    />
  </div>
)}

    </>
  );
}

const Divider = () => <div className="border-b border-gray-200 my-2" />;

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-3 p-4">
    <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
    {children}
  </div>
);

const Label = ({ text }: { text: string }) => (
  <p className="text-xs font-medium text-gray-500">{text}</p>
);

