import PostSkeleton from "./PostSkeleton";

const TimelineSkeleton = () => {
    return (
        <div className="h-screen overflow-hidden hover:overflow-auto scrollbar-gutter space-y-4 pb-4">
            {
                [...Array(3)].map((element, index) =>
                    <PostSkeleton loading={false} key={index} even={index % 2 === 0} />
                )
            }
        </div>
    );
}

export default TimelineSkeleton;